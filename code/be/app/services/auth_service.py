from fastapi import HTTPException, status
from app.models.external.hcmut_sso import HCMUT_SSO, UniversityIdentity
from app.models.internal.user import User
from app.models.internal.tutor_profile import TutorProfile
from app.models.internal.student_profile import StudentProfile
from app.core.security import verify_password
from app.models.enums.role import UserRole

class AuthService:
    @staticmethod
    async def login_and_get_token(username: str, password: str) -> str:
        """
        Handles the full login flow: Authenticates against SSO cache, 
        syncs user data, provisions internal accounts/profiles, and returns 
        the internal User ID as the access token.
        """
        
        # --- STEP 1: AUTHENTICATION (Verify against SSO Cache) ---
        
        # 1.1 Find the SSO record (simulating external server lookup)
        sso_record = await HCMUT_SSO.find_one(HCMUT_SSO.username == username)
        
        if not sso_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account does not exist in the university system."
            )
            
        # 1.2 Check password hash
        if not verify_password(password, sso_record.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password."
            )

        # --- STEP 2: USER PROVISIONING & SYNCHRONIZATION ---
        
        # 2.1 Check for existing Internal App User
        app_user = await User.find_one(User.sso_info.id == sso_record.id)
        
        if not app_user:
            # First time login: Create new internal account and profiles
            
            # 2.2 Create internal User account (Snapshot primary data)
            app_user = User(
                sso_info=sso_record,
                full_name=sso_record.full_name,
                email_edu=sso_record.contact.email_edu,
                email_personal=sso_record.contact.email_personal,
                roles=[]
            )
            await app_user.save() 
            
            # 2.3 Auto-Profile Creation (Provisioning based on IdentityType)
            
            # CASE A: LECTURER -> Auto Tutor Role + Tutor Profile
            if sso_record.identity_type == UniversityIdentity.LECTURER:
                app_user.roles.append(UserRole.TUTOR)
                await TutorProfile(
                    user=app_user,
                    display_name=f"GV. {sso_record.full_name}",
                    bio="Official HCMUT Faculty member.",
                    is_certified_by_faculty=True # Implicitly certified
                ).save()

            # CASE B: STUDENT -> Auto Student Role + Student Profile
            elif sso_record.identity_type == UniversityIdentity.STUDENT:
                app_user.roles.append(UserRole.STUDENT)
                await StudentProfile(
                    user=app_user
                ).save()

            # CASE C: STAFF -> Assign Admin/Viewer Roles based on Department
            elif sso_record.identity_type == UniversityIdentity.STAFF:
                dept = sso_record.work_info.department if sso_record.work_info else ""

                if dept == "P_CTSV":
                    app_user.roles.append(UserRole.STAFF_SA)
                elif dept == "P_DT":
                    app_user.roles.append(UserRole.STAFF_AA)
                # Note: DEPT_CHAIR/ADMIN roles are typically set separately via explicit assignment or check on position

            # Final save after role assignment
            await app_user.save()
            
        else:
            # Subsequent login: Update snapshots if changes occurred in SSO data
            is_changed = False
            
            # Sync essential snapshot fields
            if app_user.full_name != sso_record.full_name:
                app_user.full_name = sso_record.full_name
                is_changed = True
            if app_user.email_edu != sso_record.contact.email_edu:
                app_user.email_edu = sso_record.contact.email_edu
                is_changed = True
            
            if is_changed:
                await app_user.save() 

        # --- STEP 3: RETURN TOKEN ---
        return str(app_user.id) # Internal User ObjectId used as the access token