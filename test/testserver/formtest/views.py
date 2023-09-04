import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def form_view(request):
    json_data = request.body.decode("utf-8")
    data = json.loads(json_data)

    form = AuthenticationForm(data=data)
    if form.is_valid() is False:
        return JsonResponse(
            {"errors": form.errors.get_json_data(escape_html=True)},  # type: ignore
        )

    user = authenticate(
        username=form.cleaned_data.get("username"),
        password=form.cleaned_data.get("password"),
    )
    if user is not None:
        login(request, user)

    return JsonResponse({"errors": []})
