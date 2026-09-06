package io.cofrin.finance.application;

import io.cofrin.finance.domain.ImportPreview;
import io.cofrin.finance.infrastructure.CsvImportParser;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@ApplicationScoped
public class ImportPreviewService {

    private static final long MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

    private final CsvImportParser csvImportParser;

    public ImportPreviewService(CsvImportParser csvImportParser) {
        this.csvImportParser = csvImportParser;
    }

    public ImportPreview preview(FileUpload file) {
        validateFile(file);

        return csvImportParser.parse(file);
    }

    private void validateFile(FileUpload file) {
        if (file == null) {
            throw new ImportPreviewException("file is required.");
        }
        if (!looksLikeCsv(file)) {
            throw new ImportPreviewException("Only CSV uploads are supported.");
        }
        if (file.size() <= 0) {
            throw new ImportPreviewException("File is empty.");
        }
        if (file.size() > MAX_FILE_SIZE_BYTES) {
            throw new ImportPreviewException("File must be 2 MB or smaller.");
        }
    }

    private boolean looksLikeCsv(FileUpload file) {
        String fileName = file.fileName() == null ? "" : file.fileName().toLowerCase();
        String contentType = file.contentType() == null ? "" : file.contentType().toLowerCase();

        return fileName.endsWith(".csv")
                || contentType.equals("text/csv")
                || contentType.equals("application/csv")
                || contentType.equals("application/vnd.ms-excel");
    }
}
