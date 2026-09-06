package io.cofrin.finance.interfaces;

import io.cofrin.finance.application.ImportPreviewException;
import io.cofrin.finance.application.ImportPreviewService;
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

    public ImportPreviewResource(ImportPreviewService importPreviewService) {
        this.importPreviewService = importPreviewService;
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
}
