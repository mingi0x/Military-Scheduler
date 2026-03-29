import os 

def is_member(year,month,day):
    root_path="/workspaces/Largeinteractivecalendar/data/CCTV_Schedule"
    file_path=f'{year}년 {month}월 {day}일 CCTV근무.json'

    full_path=os.path.join(root_path,file_path)

    return os.path.exists(full_path)



