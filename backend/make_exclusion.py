import json
from datetime import datetime

def get_exclusion(year, month, day):
    date_str = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:
        exclusion_members = json.load(f)

    day_name=datetime.strptime(date_str, "%Y-%m-%d").strftime("%A")#요일 이름 가져오기

    type="평일" if day_name in ["Monday", "Tuesday", "Wednesday", "Thursday"] else "휴일"#근무 날짜 유형 결정
    
    exclusion_members[date_str]=[{"type": type, "excluded": []}]

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)