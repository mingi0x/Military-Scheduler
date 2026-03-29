import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ExceptionPerson {
  id: string;
  name: string;
  reason: string;
}

interface DailyManagementViewProps {
  selectedDate: Date;
  onBack: () => void;
}


const notifyPythonAboutChange = async (name: string, action: 'add' | 'remove') => {
  try {
    await fetch('https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/update-exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name,      // 대상자 이름
        action: action   // 'add' 또는 'remove'
      }),
    });
  } catch (error) {
    console.error("Python 서버 통신 실패:", error);
  }
};
// 샘플 인원 데이터

import allMemberData from '/workspaces/Largeinteractivecalendar/data/all_member_data.json';

// 2. 계급과 이름을 합쳐서 배열 생성
// Vite는 JSON을 가져오면 자동으로 객체(또는 배열)로 변환해줍니다.
const SAMPLE_PEOPLE = allMemberData.map((person: any) => `${person.이름}`);

export function DailyManagementView({ selectedDate, onBack }: DailyManagementViewProps) {
  // 1. 초기값 설정: localStorage에 저장된 값이 있으면 가져오고, 없으면 빈 배열
  const [exceptions, setExceptions] = useState<ExceptionPerson[]>(() => {
    const saved = localStorage.getItem(`exceptions_${selectedDate.toDateString()}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dutyGenerated, setDutyGenerated] = useState(false);

  // 2. exceptions 상태가 변할 때마다 localStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem(
      `exceptions_${selectedDate.toDateString()}`,
      JSON.stringify(exceptions)
    );
  }, [exceptions, selectedDate]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const filteredPeople = SAMPLE_PEOPLE.filter((name) =>
    name.includes(searchQuery)
  );

  const handleAddPerson = (name: string) => {
    // 중복 체크
    if (exceptions.some((ex) => ex.name === name)) {
      alert('이미 추가된 인원입니다.');
      return;
    }

    const newException = { id: Date.now().toString(), name, reason: '' };
    setExceptions([...exceptions, newException]);
    
    // 파이썬에 추가 알림 전송
    notifyPythonAboutChange(name, 'add'); 
    
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleRemoveException = (id: string) => {
    const personToRemove = exceptions.find(ex => ex.id === id);
  
    if (personToRemove) {
      const updated = exceptions.filter((ex) => ex.id !== id);
      setExceptions(updated);
      
      // 파이썬에 삭제된 사람 이름 전송
      notifyPythonAboutChange(personToRemove.name, 'remove');
    }
  };

  const handleUpdateException = (id: string, value: string) => {
    setExceptions(
      exceptions.map((ex) =>
        ex.id === id ? { ...ex, reason: value } : ex
      )
    );
  };

  const handleGenerateDuty = async () => {
  try {
    // 1. 서버에 근무표 생성 요청 보내기
    const response = await fetch("https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/generate-duty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 필요하다면 현재 선택된 연도/월 정보를 같이 보낼 수 있습니다.
      // body: JSON.stringify({ year: 2024, month: 5 }),
    });

    if (!response.ok) {
      throw new Error("서버 응답에 문제가 있습니다.");
    }

    const data = await response.json();

    if (data.status === "success") {
      // 2. 서버 작업이 성공하면 화면 상태를 변경
      setDutyGenerated(true);
      alert("✅ 근무표가 성공적으로 생성되었습니다!");
    } else {
      alert("❌ 생성 실패: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("서버와 통신하는 중 오류가 발생했습니다.");
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{formatDate(selectedDate)}</h1>
        </div>
        <div className="text-lg text-gray-600">열외·근무 관리</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex">
        {/* 왼쪽: 열외표 */}
        <div className="w-1/2 border-r border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">열외 현황</h2>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {exceptions.length}명
            </div>
          </div>

          {/* 열외자 추가 버튼 */}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors mb-4"
            >
              <Plus className="h-5 w-5 mx-auto mb-2 text-gray-400" />
              <span className="text-gray-600">열외자 추가</span>
            </button>
          )}

          {/* 검색창 */}
          {showSearch && (
            <div className="mb-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <Input
                type="text"
                placeholder="이름을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredPeople.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleAddPerson(name)}
                    className="w-full text-left px-3 py-2 hover:bg-white rounded transition-colors text-sm"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="w-full mt-2"
                size="sm"
              >
                취소
              </Button>
            </div>
          )}

          {/* 열외자 목록 */}
          {exceptions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              추가된 열외자가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {exceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-semibold">{ex.name}</span>
                    <Select
                      value={ex.reason}
                      onValueChange={(value) => handleUpdateException(ex.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="사유 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="휴가">휴가</SelectItem>
                        <SelectItem value="외출">외출</SelectItem>
                        <SelectItem value="외박">외박</SelectItem>
                        <SelectItem value="배차">배차</SelectItem>
                        <SelectItem value="출장">출장</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveException(ex.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 근무표 생성 버튼 */}
          <Button
            onClick={handleGenerateDuty}
            className="w-full mt-6 py-6 text-base"
            disabled={exceptions.length === 0}
          >
            근무표 생성하기
          </Button>
        </div>

        {/* 오른쪽: 근무표 */}
        <div className="w-1/2 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">근무표</h2>

          {!dutyGenerated ? (
            <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)] text-gray-400">
              <FileText className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">열외 입력 후 생성하세요</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">근무표가 생성되었습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
