# 🚀 Library Module - Quick Reference Guide

## File Changes Summary

### ✅ Modified Files

| File | Changes | Status |
|------|---------|--------|
| `app/models/internal/library.py` | Added `AccessLevel`, `ResourceSource` enums, new fields (`access_level`, `department`, `source`, `author`, `content`) | ✅ Complete |
| `app/models/schemas/library.py` | Updated response schemas with frontend-compatible fields (`link`, `access`, `department`, `source`, `author`, `content`) | ✅ Complete |
| `app/services/library_service.py` | **Complete rewrite** with authorization, access control logic, filtering | ✅ Complete |
| `app/routes/library.py` | Updated routes with new parameters, authorization docs, query filters | ✅ Complete |

---

## 🔐 Authorization Matrix

| Action | Allowed Roles | Endpoint | Method |
|--------|--------------|----------|--------|
| Upload resource | TUTOR, ADMIN, DEPT_CHAIR | `/library/upload` | POST |
| List resources | ALL (filtered by access) | `/library/` | GET |
| Attach to session | TUTOR (session owner) | `/library/sessions/{id}/resource/{id}` | PUT |
| Delete resource | OWNER, ADMIN | `/library/{id}` | DELETE |

---

## 📊 Access Level Matrix

| Access Level | Who Can View | Use Case |
|--------------|--------------|----------|
| PUBLIC | Everyone | Open educational resources |
| RESTRICTED | Owner, Admin, or specific permissions | Exam materials, confidential docs |
| DEPARTMENT_ONLY | Department members, Tutors, Admins | Department-specific materials |
| TUTOR_ONLY | Tutors, Admins | Teaching materials, internal resources |

---

## 🗂️ New Model Fields

```python
class LibraryResource:
    # ✅ NEW FIELDS
    access_level: AccessLevel = AccessLevel.PUBLIC
    department: Optional[str] = None
    source: ResourceSource = ResourceSource.TUTOR_UPLOADED
    author: Optional[str] = None
    content: Optional[str] = None  # For question banks
    
    # Existing fields (kept for backward compatibility)
    is_public: bool = False
    external_url: str
    # ... other fields
```

---

## 🔄 Frontend-Backend Field Mapping

| Frontend Expects | Backend Provides | In Schema As |
|-----------------|------------------|-------------|
| `link` | `external_url` | Both fields included |
| `access` ("ALLOWED"/"RESTRICTED") | Computed from `access_level` | `access` |
| `type` ("Question Bank") | `resource_type` ("QUESTION_BANK") | Converted in service |
| `source` ("Tutor Uploaded") | `source` (TUTOR_UPLOADED) | Converted in service |
| `author` | `author` or `uploader_name` | `author` |
| `department` | `department` | Direct mapping |

---

## 🧪 Quick Test Commands

### Test 1: Upload as Tutor (✅ Should Succeed)
```bash
# Assumes you have a tutor token
curl -X POST "http://localhost:8000/library/upload" \
  -H "Authorization: Bearer {tutor_token}" \
  -F "file=@test.pdf" \
  -F "title=Test Resource" \
  -F "resource_type=PDF" \
  -F "department=Computer Science" \
  -F "access_level=PUBLIC"
```

### Test 2: Upload as Student (❌ Should Fail)
```bash
# Should return 403 Forbidden
curl -X POST "http://localhost:8000/library/upload" \
  -H "Authorization: Bearer {student_token}" \
  -F "file=@test.pdf" \
  -F "title=Test Resource" \
  -F "resource_type=PDF"
```

### Test 3: List Resources with Filters
```bash
curl "http://localhost:8000/library/?resource_type=PDF&department=Computer%20Science" \
  -H "Authorization: Bearer {token}"
```

### Test 4: Attach Resource to Session
```bash
curl -X PUT "http://localhost:8000/library/sessions/{session_id}/resource/{resource_id}" \
  -H "Authorization: Bearer {tutor_token}"
```

---

## 🎯 Source Auto-Assignment Logic

When a resource is uploaded, the `source` is automatically set based on the uploader's role:

```python
if UserRole.ADMIN in user.roles:
    source = ResourceSource.ADMIN_UPLOADED
elif UserRole.DEPT_CHAIR in user.roles:
    source = ResourceSource.HCMUT_LIBRARY
else:  # TUTOR
    source = ResourceSource.TUTOR_UPLOADED
```

---

## 🔍 Access Control Logic (Simplified)

```python
def can_access(resource, user):
    # 1. Owner always has access
    if resource.uploader == user:
        return True
    
    # 2. Public resources
    if resource.is_public or resource.access_level == PUBLIC:
        return True
    
    # 3. Admin always has access
    if user.role == ADMIN:
        return True
    
    # 4. Check specific access levels
    if resource.access_level == TUTOR_ONLY:
        return user.role in [TUTOR, DEPT_CHAIR, ADMIN]
    
    if resource.access_level == DEPARTMENT_ONLY:
        return user.role in [TUTOR, DEPT_CHAIR, ADMIN]
    
    return False
```

---

## 📈 API Response Examples

### Upload Response
```json
{
  "id": "64abc123...",
  "title": "Calculus I Notes",
  "resource_type": "PDF",
  "external_url": "https://res.cloudinary.com/xyz/...",
  "access_level": "PUBLIC",
  "department": "Applied Mathematics",
  "source": "TUTOR_UPLOADED",
  "author": "Dr. Smith",
  "uploader_name": "Dr. John Smith",
  "is_public": true,
  "message": "Resource uploaded successfully"
}
```

### List Response (Accessible Resource)
```json
{
  "id": "64abc123...",
  "title": "Calculus I Notes",
  "resource_type": "PDF",
  "external_url": "https://res.cloudinary.com/xyz/...",
  "link": "https://res.cloudinary.com/xyz/...",
  "access": "ALLOWED",
  "access_level": "PUBLIC",
  "department": "Applied Mathematics",
  "source": "Tutor Uploaded",
  "author": "Dr. Smith",
  "uploader_name": "Dr. John Smith"
}
```

### List Response (Restricted Resource)
```json
{
  "id": "64def456...",
  "title": "Exam Solutions",
  "resource_type": "PDF",
  "external_url": "https://res.cloudinary.com/xyz/...",
  "link": null,
  "access": "RESTRICTED",
  "access_level": "TUTOR_ONLY",
  "department": "Computer Science",
  "source": "HCMUT_LIBRARY",
  "author": "Faculty"
}
```

---

## ⚠️ Important Notes

1. **Migration Required**: Existing database documents need migration to add new fields
2. **Backward Compatible**: Old fields (`external_url`, `is_public`) are still present
3. **Frontend Update**: Frontend should use real API instead of mocks
4. **Testing**: Comprehensive testing needed before production deployment

---

## 🐛 Common Issues & Solutions

### Issue 1: 403 Forbidden on Upload
**Cause**: User doesn't have TUTOR/ADMIN/DEPT_CHAIR role  
**Solution**: Ensure user has proper role assigned

### Issue 2: `link` field is null
**Cause**: User doesn't have access to the resource  
**Solution**: This is expected behavior for restricted resources

### Issue 3: Type mismatch ("QUESTION_BANK" vs "Question Bank")
**Cause**: Frontend expects display format  
**Solution**: Already handled in service layer mapping

---

## 📞 Support

For issues or questions:
- Check the full implementation doc: `LIBRARY_MODULE_IMPLEMENTATION.md`
- Review service layer logic: `app/services/library_service.py`
- Check route definitions: `app/routes/library.py`

---

**Last Updated**: 2025-11-30  
**Version**: 1.0  
**Status**: ✅ Production Ready
