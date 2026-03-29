from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from onduty_member import get_onduty_members
from cafe_member import get_cafe_members
from CCTV_member import get_cctv_members
from add_exclusion import add_exclusion
from remove_exclusion import remove_exclusion
from is_member import is_member
# from make_exclusion import get_exclusion

current_date={"year": 0, "month": 0, "day": 0}#현재 날짜 정보 초기화

app = FastAPI()

# 1. CORS 설정 (한 번만 선언하면 모든 엔드포인트에 적용됩니다)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 데이터 모델 정의 ---

class CalendarData(BaseModel):
    year: int
    month: int
    day: int
    type: str

class ExceptionChange(BaseModel):
    name: str
    action: str  # 'add' 또는 'remove'

# --- API 엔드포인트 ---

# 1. 날짜 및 타입 정보 수신
@app.post("/api/calendar")
async def receive_calendar_data(data: CalendarData):
    current_date["year"] = data.year
    current_date["month"] = data.month
    current_date["day"] = data.day

    # if(data.day!=0):
    #     get_exclusion(data.year, data.month, data.day)
    print(f"📅 [날짜 수신] 타입: {data.type}")
    print(f"   정보: {data.year}년 {data.month}월 {data.day}일")
    return {"status": "ok", "message": f"{data.year}-{data.month} 데이터 수신 완료"}

# 2. 열외자 명단 수신
@app.post("/api/update-exceptions")
async def update_exceptions(data: ExceptionChange):
    year = current_date["year"]
    month = current_date["month"]
    day = current_date["day"]

    if data.action == "remove":
        remove_exclusion(year,month,day,data.name)
        print(f"🔥 삭제된 인원: {data.name}")
        # 여기서 JSON 파일에서 해당 이름을 찾아 삭제하는 로직 수행
    elif data.action == "add":
        add_exclusion(year,month,day,data.name)
        print(f"✅ 추가된 인원: {data.name}")
        # 여기서 JSON 파일에 해당 이름을 추가하는 로직 수행
        
    return {"status": "success", "processed_name": data.name}

# 3. 근무표 생성 요청
@app.post("/api/generate-duty")
async def generate_duty():
    # 여기에 실제 근무표 생성 로직 작성
    year = current_date["year"]
    month = current_date["month"]
    day = current_date["day"]

    exists = is_member(year, month, day)

    if exists:
        # 파일이 있으면 아무것도 안 함
        print(f"이미 {year}-{month}-{day} 근무표가 있어서 생성을 건너뜁니다.")
        return {
            "status": "exists", 
            "message": "이미 근무표가 존재합니다."
        }
    else:
        # 파일이 없으면 생성
        get_cctv_members(year, month, day)
        print(f"새로운 {year}-{month}-{day} 근무표를 생성했습니다.")
        return {
            "status": "success", 
            "message": "새로운 근무표를 생성했습니다."
        }
    # 예: 파일 읽기 -> 알고리즘 실행 -> 결과 저장
    # success = run_generation_logic()
    
    return {"status": "success", "message": "Backend logic executed"}