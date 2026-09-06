package io.cofrin.finance.interfaces;

import io.cofrin.finance.application.CreateOrUpdateTransactionCommand;
import io.cofrin.finance.application.TransactionNotFoundException;
import io.cofrin.finance.application.TransactionService;
import io.cofrin.finance.application.TransactionValidationException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.UUID;

@Path("/api/transactions")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TransactionResource {

    private final TransactionService transactionService;

    public TransactionResource(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GET
    public Response listTransactions() {
        return Response.ok(transactionService.listTransactions().stream()
                .map(TransactionResponse::fromDomain)
                .toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getTransaction(@PathParam("id") UUID id) {
        try {
            return Response.ok(TransactionResponse.fromDomain(transactionService.getTransaction(id))).build();
        } catch (TransactionNotFoundException exception) {
            return notFound(exception);
        }
    }

    @POST
    public Response createTransaction(TransactionRequest request) {
        try {
            TransactionResponse response = TransactionResponse.fromDomain(
                    transactionService.createTransaction(toCommand(request))
            );

            return Response.created(URI.create("/api/transactions/" + response.id()))
                    .entity(response)
                    .build();
        } catch (TransactionValidationException exception) {
            return badRequest(exception);
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateTransaction(@PathParam("id") UUID id, TransactionRequest request) {
        try {
            return Response.ok(TransactionResponse.fromDomain(
                    transactionService.updateTransaction(id, toCommand(request))
            )).build();
        } catch (TransactionValidationException exception) {
            return badRequest(exception);
        } catch (TransactionNotFoundException exception) {
            return notFound(exception);
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteTransaction(@PathParam("id") UUID id) {
        try {
            transactionService.deleteTransaction(id);

            return Response.noContent().build();
        } catch (TransactionNotFoundException exception) {
            return notFound(exception);
        }
    }

    private CreateOrUpdateTransactionCommand toCommand(TransactionRequest request) {
        if (request == null) {
            return null;
        }

        return new CreateOrUpdateTransactionCommand(
                request.transactionDate(),
                request.description(),
                request.amount(),
                request.accountId(),
                request.categoryId(),
                request.notes()
        );
    }

    private Response badRequest(RuntimeException exception) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ApiError(exception.getMessage()))
                .build();
    }

    private Response notFound(RuntimeException exception) {
        return Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiError(exception.getMessage()))
                .build();
    }
}
