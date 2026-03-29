import json
import random

def get_cctv_members(year, month, day):
    date_str = f"{year}-{month:02d}-{day:02d}"  # 날짜 문자열 생성
    yesterday_worker=[]  # 어제 근무자 초기화
    cctv_schedule=[]  # CCTV 근무 스케줄표 초기화

    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "r", encoding="utf-8") as f:  # 전체 근무자 정보 로드
        all_members = json.load(f)

    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "r", encoding="utf-8") as f:  # 열외자 정보 로드
        exclusion_members = json.load(f)

    weight=2.0 if exclusion_members.get(date_str, []).get('type') == "휴일" else 1.0#휴일이면 가중치 2.0, 평일이면 가중치 1.0

    today_excluded=exclusion_members.get(date_str, []).get('excluded', [])#오늘 열외자 명단 가져오기

    candidates=sorted(all_members, key=lambda x: x["CCTV점수"])#CCTV 점수 기준으로 근무자 정렬

    worker=[name for name in candidates if name["이름"] not in today_excluded and name["이름"] not in yesterday_worker]#열외자 명단에 없는 근무자 중에서 선정

    selected_worker=worker[:12]#선정된 근무자 중에서 상위 12명 선택

    random.shuffle(selected_worker)  # 선정된 근무자 리스트를 무작위로 섞음

    yesterday_worker=[worker["이름"] for worker in selected_worker]#오늘 선정된 근무자를 내일의 어제 근무자로 저장

    for worker in selected_worker:
        all_members[all_members.index(worker)]["CCTV점수"]+=weight#선정된 근무자의 CCTV 점수 증가
        cctv_schedule.append({"이름":worker["이름"], "CCTV점수": all_members[all_members.index(worker)]["CCTV점수"]})#근무 스케줄표에 선정된 근무자 이름과 점수 추가
        exclusion_members[date_str]['excluded'].extend([worker["이름"]])#오늘 날짜의 열외자 명단에 선정된 근무자 추가

    file_path=f'/workspaces/Largeinteractivecalendar/data/CCTV_Schedule/{year}년 {month}월 {day}일 CCTV근무.json'#근무 스케줄표 저장 경로 설정
    with open(file_path, "w", encoding="utf-8") as f:#근무 스케줄표 저장
        json.dump(cctv_schedule, f, ensure_ascii=False, indent=4)
    with open("/workspaces/Largeinteractivecalendar/data/exclusion_member.json", "w", encoding="utf-8") as f:#열외자 명단 저장(업데이트)
        json.dump(exclusion_members, f, ensure_ascii=False, indent=4)
    with open("/workspaces/Largeinteractivecalendar/data/all_member_data.json", "w", encoding="utf-8") as f:#전체 근무자 정보 저장(업데이트)
        json.dump(all_members, f, ensure_ascii=False, indent=4)


