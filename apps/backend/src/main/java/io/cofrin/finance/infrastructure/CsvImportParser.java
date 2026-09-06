package io.cofrin.finance.infrastructure;

import io.cofrin.finance.domain.ImportPreview;
import io.cofrin.finance.domain.ImportRowStatus;
import io.cofrin.finance.domain.ImportWarning;
import io.cofrin.finance.domain.PreviewTransaction;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class CsvImportParser {

    private static final String INSTITUTION = "inter";
    private static final String SOURCE_TYPE = "csv";
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter BRAZILIAN_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter SHORT_BRAZILIAN_DATE_FORMATTER = new DateTimeFormatterBuilder()
            .appendPattern("dd/MM/")
            .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
            .toFormatter();
    private static final Set<String> DATE_HEADERS = Set.of("data", "date", "data_lancamento", "data_da_transacao");
    private static final Set<String> DESCRIPTION_HEADERS = Set.of(
            "historico",
            "descricao",
            "description",
            "lancamento",
            "descricao_do_lancamento",
            "detalhes"
    );
    private static final Set<String> AMOUNT_HEADERS = Set.of(
            "valor",
            "amount",
            "valor_rs",
            "valor_r",
            "valor_da_transacao",
            "valor_do_lancamento"
    );
    private static final Set<String> EXTERNAL_ID_HEADERS = Set.of("identificador", "id", "id_externo", "external_id");

    public ImportPreview parse(FileUpload file) {
        String content = readContent(file);
        HeaderLocation headerLocation = findHeaderLocation(content);
        String tableContent = content.lines()
                .skip(headerLocation.lineIndex())
                .collect(Collectors.joining("\n"));

        try (CSVParser parser = createParser(tableContent, headerLocation.delimiter())) {
            Map<String, String> headerNames = resolveHeaders(parser.getHeaderMap().keySet());
            List<ImportWarning> warnings = new ArrayList<>();
            List<PreviewTransaction> transactions = new ArrayList<>();

            if (!hasRequiredHeaders(headerNames)) {
                warnings.add(new ImportWarning(
                        null,
                        null,
                        "unsupported_headers",
                        "CSV must include date, description, and amount columns."
                ));
                return new ImportPreview(file.fileName(), SOURCE_TYPE, INSTITUTION, 0, 0, warnings.size(), List.of(), warnings);
            }

            for (CSVRecord record : parser) {
                parseRecord(record, headerLocation.lineIndex(), headerNames, transactions, warnings);
            }

            markDuplicateRows(transactions, warnings);

            int validCount = (int) transactions.stream()
                    .filter(transaction -> transaction.status() == ImportRowStatus.VALID)
                    .count();

            return new ImportPreview(
                    file.fileName(),
                    SOURCE_TYPE,
                    INSTITUTION,
                    transactions.size(),
                    validCount,
                    warnings.size(),
                    transactions,
                    warnings
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Could not parse CSV upload.", exception);
        }
    }

    private void parseRecord(
            CSVRecord record,
            int headerLineIndex,
            Map<String, String> headers,
            List<PreviewTransaction> transactions,
            List<ImportWarning> warnings
    ) {
        int rowNumber = Math.toIntExact(record.getRecordNumber() + headerLineIndex + 1);

        if (isBlankRecord(record)) {
            warnings.add(new ImportWarning(rowNumber, null, "empty_row", "Row is empty."));
            return;
        }

        String rawDate = value(record, headers.get("date"));
        String rawDescription = value(record, headers.get("description"));
        String rawAmount = value(record, headers.get("amount"));
        String externalId = headers.containsKey("externalId") ? normalizeOptional(value(record, headers.get("externalId"))) : null;
        String normalizedDate = normalizeDate(rawDate);
        String normalizedDescription = normalizeDescription(rawDescription);
        String normalizedAmount = normalizeMoney(rawAmount);
        ImportRowStatus status = ImportRowStatus.VALID;

        if (normalizedDate == null) {
            warnings.add(new ImportWarning(rowNumber, "transactionDate", "invalid_date", "Date is invalid."));
            status = ImportRowStatus.INVALID;
        }
        if (normalizedDescription.isBlank()) {
            warnings.add(new ImportWarning(rowNumber, "description", "missing_description", "Description is required."));
            status = ImportRowStatus.INVALID;
        }
        if (normalizedAmount == null) {
            warnings.add(new ImportWarning(rowNumber, "amount", "invalid_amount", "Amount is invalid."));
            status = ImportRowStatus.INVALID;
        }

        String sourceHash = status == ImportRowStatus.VALID
                ? createSourceHash(normalizedDate, normalizedDescription, normalizedAmount, externalId)
                : null;

        transactions.add(new PreviewTransaction(
                normalizedDate,
                normalizedDescription,
                normalizedAmount,
                rawDescription == null ? "" : rawDescription.trim(),
                externalId,
                sourceHash,
                rowNumber,
                status
        ));
    }

    private String readContent(FileUpload file) {
        try {
            String content = Files.readString(file.uploadedFile(), StandardCharsets.UTF_8);

            return content.startsWith("\uFEFF") ? content.substring(1) : content;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read CSV upload.", exception);
        }
    }

    private CSVParser createParser(String content, char delimiter) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setDelimiter(delimiter)
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true)
                .get();

        return format.parse(new StringReader(content));
    }

    private HeaderLocation findHeaderLocation(String content) {
        List<String> lines = content.lines().toList();

        for (char delimiter : List.of(';', ',')) {
            for (int index = 0; index < lines.size(); index++) {
                if (isHeaderLine(lines.get(index), delimiter)) {
                    return new HeaderLocation(delimiter, index);
                }
            }
        }

        return new HeaderLocation(detectDelimiter(content), 0);
    }

    private boolean isHeaderLine(String line, char delimiter) {
        if (line.isBlank() || line.indexOf(delimiter) < 0) {
            return false;
        }

        Map<String, String> headers = resolveHeaders(Arrays.stream(line.split(String.valueOf(delimiter), -1))
                .collect(Collectors.toSet()));

        return hasRequiredHeaders(headers);
    }

    private char detectDelimiter(String content) {
        String firstLine = content.lines()
                .filter(line -> !line.isBlank() && (line.contains(";") || line.contains(",")))
                .findFirst()
                .orElse("");
        long semicolonCount = firstLine.chars().filter(character -> character == ';').count();
        long commaCount = firstLine.chars().filter(character -> character == ',').count();

        return semicolonCount > commaCount ? ';' : ',';
    }

    private Map<String, String> resolveHeaders(Set<String> rawHeaders) {
        Map<String, String> headers = new HashMap<>();

        for (String rawHeader : rawHeaders) {
            String normalizedHeader = normalizeHeader(rawHeader);

            if (isDateHeader(normalizedHeader)) {
                headers.putIfAbsent("date", rawHeader);
            }
            if (isDescriptionHeader(normalizedHeader)) {
                headers.putIfAbsent("description", rawHeader);
            }
            if (isAmountHeader(normalizedHeader)) {
                headers.putIfAbsent("amount", rawHeader);
            }
            if (isExternalIdHeader(normalizedHeader)) {
                headers.putIfAbsent("externalId", rawHeader);
            }
        }

        return headers;
    }

    private boolean hasRequiredHeaders(Map<String, String> headers) {
        return headers.containsKey("date")
                && headers.containsKey("description")
                && headers.containsKey("amount");
    }

    private String value(CSVRecord record, String header) {
        if (header == null || !record.isMapped(header)) {
            return "";
        }

        return record.get(header);
    }

    private boolean isBlankRecord(CSVRecord record) {
        for (String value : record) {
            if (value != null && !value.isBlank()) {
                return false;
            }
        }

        return true;
    }

    private String normalizeHeader(String header) {
        return removeAccents(header.replace("\"", ""))
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }

    private boolean isDateHeader(String normalizedHeader) {
        return DATE_HEADERS.contains(normalizedHeader)
                || normalizedHeader.startsWith("data_")
                || normalizedHeader.endsWith("_data");
    }

    private boolean isDescriptionHeader(String normalizedHeader) {
        return DESCRIPTION_HEADERS.contains(normalizedHeader)
                || normalizedHeader.contains("historico")
                || normalizedHeader.contains("descricao")
                || normalizedHeader.equals("memo")
                || normalizedHeader.equals("narrativa")
                || (normalizedHeader.contains("lancamento") && !isDateHeader(normalizedHeader) && !isAmountHeader(normalizedHeader));
    }

    private boolean isAmountHeader(String normalizedHeader) {
        return AMOUNT_HEADERS.contains(normalizedHeader)
                || normalizedHeader.contains("valor")
                || normalizedHeader.contains("amount");
    }

    private boolean isExternalIdHeader(String normalizedHeader) {
        return EXTERNAL_ID_HEADERS.contains(normalizedHeader)
                || normalizedHeader.contains("identificador")
                || normalizedHeader.contains("external_id");
    }

    private String normalizeDate(String date) {
        String trimmedDate = date == null ? "" : date.trim();

        if (trimmedDate.isBlank()) {
            return null;
        }

        for (DateTimeFormatter formatter : List.of(ISO_DATE_FORMATTER, BRAZILIAN_DATE_FORMATTER, SHORT_BRAZILIAN_DATE_FORMATTER)) {
            try {
                return LocalDate.parse(trimmedDate, formatter).format(ISO_DATE_FORMATTER);
            } catch (DateTimeParseException ignored) {
            }
        }

        return null;
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return "";
        }

        return description.trim().replaceAll("\\s+", " ");
    }

    private String normalizeMoney(String amount) {
        String cleanedAmount = amount == null ? "" : amount
                .trim()
                .replace("\u00A0", "")
                .replace("R$", "")
                .replaceAll("\\s+", "");

        if (cleanedAmount.isBlank()) {
            return null;
        }

        if (cleanedAmount.contains(",")) {
            cleanedAmount = cleanedAmount.replace(".", "").replace(",", ".");
        }

        try {
            return new BigDecimal(cleanedAmount).toPlainString();
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String normalizeOptional(String value) {
        String normalizedValue = value == null ? "" : value.trim();

        return normalizedValue.isBlank() ? null : normalizedValue;
    }

    private void markDuplicateRows(List<PreviewTransaction> transactions, List<ImportWarning> warnings) {
        Map<String, Integer> firstRowByHash = new HashMap<>();

        for (int index = 0; index < transactions.size(); index++) {
            PreviewTransaction transaction = transactions.get(index);

            if (transaction.sourceHash() == null) {
                continue;
            }

            Integer firstRowNumber = firstRowByHash.putIfAbsent(transaction.sourceHash(), transaction.rowNumber());

            if (firstRowNumber != null) {
                transactions.set(index, new PreviewTransaction(
                        transaction.transactionDate(),
                        transaction.description(),
                        transaction.amount(),
                        transaction.rawDescription(),
                        transaction.externalId(),
                        transaction.sourceHash(),
                        transaction.rowNumber(),
                        ImportRowStatus.DUPLICATE
                ));
                warnings.add(new ImportWarning(
                        transaction.rowNumber(),
                        "sourceHash",
                        "duplicate_row",
                        "Row duplicates row " + firstRowNumber + "."
                ));
            }
        }
    }

    private String createSourceHash(
            String transactionDate,
            String description,
            String amount,
            String externalId
    ) {
        String normalizedAmount = new BigDecimal(amount).stripTrailingZeros().toPlainString();
        String identity = String.join("|",
                INSTITUTION,
                SOURCE_TYPE,
                transactionDate,
                normalizedAmount,
                description.toLowerCase(Locale.ROOT),
                externalId == null ? "" : externalId
        );

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(identity.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();

            for (byte hashByte : hashBytes) {
                hash.append(String.format("%02x", hashByte));
            }

            return hash.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private String removeAccents(String value) {
        String normalizedValue = Normalizer.normalize(value, Normalizer.Form.NFD);

        return normalizedValue.replaceAll("\\p{M}", "");
    }

    private record HeaderLocation(char delimiter, int lineIndex) {
    }
}
