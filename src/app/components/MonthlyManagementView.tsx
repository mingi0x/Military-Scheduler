import { ArrowLeft, FileText, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MonthlyManagementViewProps {
  year: number;
  month: number;
  onBack: () => void;
}

export function MonthlyManagementView({ year, month, onBack }: MonthlyManagementViewProps) {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-white shadow-sm p-6 border-b shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{year}년 {month}월 관리</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        {/* 카드 영역 */}
        <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-2 gap-6 overflow-hidden">

          {/* 특이사항 카드 */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-4 shrink-0">
              <CardTitle className="text-2xl">당직 근무표</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-gray-400 p-0">
              <ClipboardList className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">특이사항 입력 후 생성하세요</p>
            </CardContent>
          </Card>

          {/* 식당 청소 인원 카드 */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-4 shrink-0">
              <CardTitle className="text-2xl">식당 청소 근무표</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-gray-400 p-0">
              <FileText className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-center">특이사항 입력 후 생성하세요</p>
            </CardContent>
          </Card>
        </div>

        {/* 하단 버튼 */}
        <div className="max-w-7xl w-full mx-auto grid grid-cols-2 gap-6 shrink-0">
          <Button size="lg" className="w-full h-14 text-base font-semibold">
            <FileText className="h-5 w-5 mr-2" />
            근무표 생성하기
          </Button>
          <Button size="lg" className="w-full h-14 text-base font-semibold">
            <FileText className="h-5 w-5 mr-2" />
            근무표 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}