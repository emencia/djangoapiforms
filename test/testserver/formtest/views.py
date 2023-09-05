import json
from django.http import HttpRequest, HttpResponseServerError, JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError
from .schemas import LoginFormContract


@csrf_exempt
def form_view(request: HttpRequest) -> HttpResponse:
    json_data = request.body.decode("utf-8")
    data = json.loads(json_data)

    # validate the data vs the schema
    try:
        LoginFormContract(**data)
    except ValidationError as e:
        return JsonResponse({"error": {"type": "schema"}, "errors": e.errors()})

    # process form
    form = AuthenticationForm(data=data)
    if form.is_valid() is False:
        return JsonResponse(
            {
                "error": {"type": "validation"},
                "errors": form.errors.get_json_data(escape_html=True),  # type: ignore
            },
        )

    # authenticate user
    user = authenticate(
        username=form.cleaned_data.get("username"),
        password=form.cleaned_data.get("password"),
    )
    if user is not None:
        login(request, user)

    return HttpResponse(status=204)


@csrf_exempt
def form_view_with_status_codes(request: HttpRequest) -> HttpResponse:
    json_data = request.body.decode("utf-8")
    data = json.loads(json_data)

    # validate the data vs the schema
    try:
        LoginFormContract(**data)
    except ValidationError as e:
        return JsonResponse(
            {"error": {"type": "schema"}, "errors": e.errors()}, status=418
        )

    # process form
    form = AuthenticationForm(data=data)
    if form.is_valid() is False:
        return JsonResponse(
            {
                "error": {"type": "validation"},
                "errors": form.errors.get_json_data(escape_html=True),  # type: ignore
            },
            status=422,
        )

    # authenticate user
    user = authenticate(
        username=form.cleaned_data.get("username"),
        password=form.cleaned_data.get("password"),
    )
    if user is not None:
        login(request, user)

    return HttpResponse(status=204)


@csrf_exempt
def server_error(request: HttpRequest) -> HttpResponse:
    return HttpResponseServerError()


@csrf_exempt
def form_view_custom_response(request: HttpRequest) -> HttpResponse:
    json_data = request.body.decode("utf-8")
    data = json.loads(json_data)

    # validate the data vs the schema
    try:
        LoginFormContract(**data)
    except ValidationError as e:
        return JsonResponse(
            {"error": {"type": "schema"}, "errors": e.errors()}, status=418
        )

    # process form
    form = AuthenticationForm(data=data)
    if form.is_valid() is False:
        return JsonResponse(
            {
                "error": {"type": "validation"},
                "errors": form.errors.get_json_data(escape_html=True),  # type: ignore
            },
            status=422,
        )

    # authenticate user
    user = authenticate(
        username=form.cleaned_data.get("username"),
        password=form.cleaned_data.get("password"),
    )
    if user is not None:
        login(request, user)

    return JsonResponse({"extra": "foo"})
