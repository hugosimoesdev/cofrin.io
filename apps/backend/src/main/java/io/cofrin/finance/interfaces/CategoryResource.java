package io.cofrin.finance.interfaces;

import io.cofrin.finance.application.CategoryNotFoundException;
import io.cofrin.finance.application.CategoryService;
import io.cofrin.finance.application.CategoryValidationException;
import io.cofrin.finance.application.CreateOrUpdateCategoryCommand;
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

@Path("/api/categories")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CategoryResource {

    private final CategoryService categoryService;

    public CategoryResource(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GET
    public Response listCategories() {
        return Response.ok(categoryService.listCategories().stream()
                .map(CategoryResponse::fromDomain)
                .toList()).build();
    }

    @GET
    @Path("/{id}")
    public Response getCategory(@PathParam("id") UUID id) {
        try {
            return Response.ok(CategoryResponse.fromDomain(categoryService.getCategory(id))).build();
        } catch (CategoryNotFoundException exception) {
            return notFound(exception);
        }
    }

    @POST
    public Response createCategory(CategoryRequest request) {
        try {
            CategoryResponse response = CategoryResponse.fromDomain(
                    categoryService.createCategory(toCommand(request))
            );

            return Response.created(URI.create("/api/categories/" + response.id()))
                    .entity(response)
                    .build();
        } catch (CategoryValidationException exception) {
            return badRequest(exception);
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateCategory(@PathParam("id") UUID id, CategoryRequest request) {
        try {
            return Response.ok(CategoryResponse.fromDomain(
                    categoryService.updateCategory(id, toCommand(request))
            )).build();
        } catch (CategoryValidationException exception) {
            return badRequest(exception);
        } catch (CategoryNotFoundException exception) {
            return notFound(exception);
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteCategory(@PathParam("id") UUID id) {
        try {
            categoryService.deleteCategory(id);

            return Response.noContent().build();
        } catch (CategoryNotFoundException exception) {
            return notFound(exception);
        }
    }

    private CreateOrUpdateCategoryCommand toCommand(CategoryRequest request) {
        if (request == null) {
            return null;
        }

        return new CreateOrUpdateCategoryCommand(
                request.name(),
                request.type()
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
