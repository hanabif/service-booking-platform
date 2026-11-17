from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_staff))

class IsBusinessOwner(permissions.BasePermission):
    """Allows access to business owners and admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['business_owner', 'admin'] or request.user.is_staff))

class IsCustomer(permissions.BasePermission):
    """Allows access to customers and admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['customer', 'admin'] or request.user.is_staff))
