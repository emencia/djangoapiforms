from django.urls import path
from .views import (
    form_view,
    form_view_with_status_codes,
    server_error,
    form_view_custom_response,
)


urlpatterns = [
    path("", form_view, name="index"),
    path("status", form_view_with_status_codes, name="status"),
    path("error", server_error, name="error"),
    path("custom", form_view_custom_response, name="custom"),
]
