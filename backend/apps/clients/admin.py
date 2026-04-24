from django.contrib import admin
from .models import Client
# Register your models here.

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom')
    #list_display = ('id', 'first_name', 'last_name','role','phone', 'avatar', 'is_active', 'is_staff', 'date_joined', 'last_login')
    ##list_filter = ('date_joined',);