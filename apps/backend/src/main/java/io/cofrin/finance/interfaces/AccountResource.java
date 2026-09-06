package io.cofrin.finance.interfaces;

import io.cofrin.finance.application.AccountNotFoundException;
import io.cofrin.finance.application.AccountService;
import io.cofrin.finance.application.AccountValidationException;
import io.cofrin.finance.application.CreateOrUpdateAccountCommand;
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

@Path("/api/accounts")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AccountResource {

    private final AccountService accountService;

    public AccountResource(AccountService accountService) {
        this.accountService = accountService;
    }

    @GET
    public Response listAccounts() {
        return Response.ok(accountService.listAccounts().stream()
                .map(AccountResponse::fromDomain)
                .toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getAccount(@PathParam("id") UUID id) {
        try {
            return Response.ok(AccountResponse.fromDomain(accountService.getAccount(id))).build();
        } catch (AccountNotFoundException exception) {
            return notFound(exception);
        }
    }

    @POST
    public Response createAccount(AccountRequest request) {
        try {
            AccountResponse response = AccountResponse.fromDomain(
                    accountService.createAccount(toCommand(request))
            );

            return Response.created(URI.create("/api/accounts/" + response.id()))
                    .entity(response)
                    .build();
        } catch (AccountValidationException exception) {
            return badRequest(exception);
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateAccount(@PathParam("id") UUID id, AccountRequest request) {
        try {
            return Response.ok(AccountResponse.fromDomain(
                    accountService.updateAccount(id, toCommand(request))
            )).build();
        } catch (AccountValidationException exception) {
            return badRequest(exception);
        } catch (AccountNotFoundException exception) {
            return notFound(exception);
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteAccount(@PathParam("id") UUID id) {
        try {
            accountService.deleteAccount(id);

            return Response.noContent().build();
        } catch (AccountNotFoundException exception) {
            return notFound(exception);
        }
    }

    private CreateOrUpdateAccountCommand toCommand(AccountRequest request) {
        if (request == null) {
            return null;
        }

        return new CreateOrUpdateAccountCommand(
                request.name(),
                request.type(),
                request.initialBalance()
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
