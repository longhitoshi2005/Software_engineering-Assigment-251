# HCMUT SSO Authentication Logic

## Tổng quan

Hệ thống sử dụng logic đăng nhập **CHẶT CHẼ** giống HCMUT SSO thực tế:
- **Chỉ đăng nhập bằng USERNAME**
- **email_edu LUÔN LUÔN được suy diễn từ username**: `email_edu = username + "@hcmut.edu.vn"`
- **KHÔNG CHO PHÉP email_edu và username khác nhau** - Đảm bảo consistency tuyệt đối

## Thiết kế Database

### HCMUT_SSO Model

```python
class HCMUT_SSO(Document):
    username: str                    # e.g., "lan.tran"
    password_hash: str
    identity_id: str
    identity_type: UniversityIdentity
    contact: ContactInfo {
        email_edu: str              # ALWAYS = username@hcmut.edu.vn (e.g., "lan.tran@hcmut.edu.vn")
        email_personal: Optional[str]
        phone_number: Optional[str]
    }
    # ... other fields
    
    @field_validator('contact')
    @classmethod
    def validate_email_edu_consistency(cls, contact, info):
        """Enforce: email_edu MUST be username@hcmut.edu.vn"""
        username = info.data.get('username')
        expected_email = f"{username}@hcmut.edu.vn"
        if contact.email_edu != expected_email:
            raise ValueError(f"email_edu must be '{expected_email}'")
        return contact
```

### Quyết định Thiết kế

**✅ USERNAME ONLY LOGIN + AUTO-DERIVED EMAIL_EDU**

**Lý do:**
1. **Tính nhất quán tối đa**: Email_edu LUÔN = username@hcmut.edu.vn, không có ngoại lệ
2. **Bảo mật chặt chẽ**: Không cho phép user input email để tránh inconsistency
3. **Data Integrity**: Validator đảm bảo email_edu và username không bao giờ mâu thuẫn
4. **Rõ ràng**: Logic đơn giản, dễ maintain, không có edge cases

## Authentication Flow

### 1. User Input

User **CHỈ có thể** đăng nhập bằng:
- **Username**: `lan.tran` ✅
- ~~Email: `lan.tran@hcmut.edu.vn`~~ ❌ KHÔNG HỖ TRỢ

### 2. Backend Authentication

```python
# NO normalization needed - only accept username
sso_record = await HCMUT_SSO.find_one(HCMUT_SSO.username == username)
```

### 3. Password Verification

```python
if not verify_password(password, sso_record.password_hash):
    raise HTTPException(status_code=401, detail="Incorrect password")
```

## Test Accounts

Tất cả test accounts đều có password: `123`

| Username | Email_edu (auto-derived) | Role | Description |
|----------|--------------------------|------|-------------|
| `head.cse` | `head.cse@hcmut.edu.vn` | DEPT_CHAIR, TUTOR | Trưởng khoa |
| `tuan.pham` | `tuan.pham@hcmut.edu.vn` | TUTOR | Giảng viên |
| `student_gioi` | `student_gioi@hcmut.edu.vn` | STUDENT, TUTOR | Sinh viên kiêm tutor |
| `lan.tran` | `lan.tran@hcmut.edu.vn` | STUDENT | Sinh viên |

## Frontend Implementation

### Login Form

```typescript
// User CHỈ nhập username
const loginData = {
  username: username,  // e.g., "lan.tran"
  password: password
};

// email_edu is auto-derived in backend
```

### Role Mapping

```typescript
// Username only - NO email support
const ROLE_MAPPING = {
  "lan.tran": { role: Role.STUDENT, ... },
  "tuan.pham": { role: Role.TUTOR, ... }
};
```

## API Endpoint

### POST /auth/login

**Request:**

```json
{
  "username": "lan.tran",
  "password": "123"
}
```

**Response (Success):**

```json
{
  "message": "Login successful"
}
```

*Cookie: access_token (HttpOnly)*

**Response (Error):**

```json
{
  "detail": "Account does not exist in the university system."
}
```

or

```json
{
  "detail": "Incorrect password."
}
```

## Benefits của Approach này

1. **Data Integrity**:
   - Email_edu LUÔN consistent với username
   - Validator tự động catch inconsistencies
   - Không có edge cases hay data corruption

2. **Maintainable**:
   - Logic cực kỳ rõ ràng, không có normalization
   - Dễ debug và test
   - Không có hidden logic

3. **Secure**:
   - Giảm attack surface (không accept email input)
   - Đơn giản hóa validation
   - Tránh phishing với fake emails

4. **Realistic**:
   - Giống hệ thống SSO thực tế của HCMUT
   - Username-based authentication
   - Email chỉ dùng để contact, không dùng login

## Example Usage

**Đăng nhập bằng username:**

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"lan.tran","password":"123"}'
```

✅ **Đây là cách DUY NHẤT được hỗ trợ!**
