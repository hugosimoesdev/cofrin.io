package io.cofrin.finance.interfaces;

import io.cofrin.finance.application.CommitImportTransactionCommand;
import io.cofrin.finance.application.ImportCommitService;
import io.cofrin.finance.application.ImportPreviewException;
import io.cofrin.finance.application.ImportPreviewService;
import io.cofrin.finance.application.TransactionValidationException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/api/imports")
@Produces(MediaType.APPLICATION_JSON)
public class ImportPreviewResource {

    private final ImportPreviewService importPreviewService;
    private final ImportCommitService importCommitService;

    public ImportPreviewResource(
            ImportPreviewService importPreviewService,
            ImportCommitService importCommitService
    ) {
        this.importPreviewService = importPreviewService;
        this.importCommitService = importCommitService;
    }

    @POST
    @Path("/preview")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response preview(@RestForm("file") FileUpload file) {
        try {
            return Response.ok(importPreviewService.preview(file)).build();
        } catch (ImportPreviewException exception) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiError(exception.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/commit")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response commit(ImportCommitRequest request) {
        try {
            return Response.ok(ImportCommitResponse.fromDomain(
                    importCommitService.commit(toCommands(request))
            )).build();
        } catch (TransactionValidationException exception) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiError(exception.getMessage()))
                    .build();
        }
    }

    private java.util.List<CommitImportTransactionCommand> toCommands(ImportCommitRequest request) {
        if (request == null || request.transactions() == null) {
            return null;
        }

        return request.transactions().stream()
                .map(this::toCommand)
                .toList();
    }

    private CommitImportTransactionCommand toCommand(ImportCommitItemRequest request) {
        if (request == null) {
            return null;
        }

        return new CommitImportTransactionCommand(
                request.transactionDate(),
                request.description(),
                request.amount(),
                request.accountId(),
                request.categoryId(),
                request.notes(),
                request.sourceType(),
                request.institution(),
                request.sourceFileName(),
                request.sourceRowNumber(),
                request.sourceHash()
        );
    }
}
