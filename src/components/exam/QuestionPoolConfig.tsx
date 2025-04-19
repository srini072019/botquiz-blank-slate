
import { useState, useEffect } from "react";
import { Subject } from "@/types/subject.types";
import { QuestionPool, SubjectPoolItem } from "@/types/question-pool.types";
import PoolHeader from "./pool/PoolHeader";
import SubjectsList from "./pool/SubjectsList";

interface QuestionPoolConfigProps {
  subjects: Subject[];
  initialPool?: QuestionPool;
  onPoolChange: (pool: QuestionPool) => void;
  availableQuestionCount: number;
}

const QuestionPoolConfig = ({ 
  subjects, 
  initialPool, 
  onPoolChange,
  availableQuestionCount
}: QuestionPoolConfigProps) => {
  const [pool, setPool] = useState<QuestionPool>(
    initialPool || {
      totalQuestions: 10,
      subjects: []
    }
  );

  const addSubject = () => {
    if (subjects.length === 0) return;
    
    const availableSubjects = subjects.filter(
      subject => !pool.subjects.some(poolSubject => poolSubject.subjectId === subject.id)
    );
    
    if (availableSubjects.length === 0) return;
    
    const newSubjectItem: SubjectPoolItem = {
      subjectId: availableSubjects[0].id,
      count: 5
    };
    
    const updatedPool = {
      ...pool,
      subjects: [...pool.subjects, newSubjectItem]
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const removeSubject = (index: number) => {
    const updatedSubjects = [...pool.subjects];
    updatedSubjects.splice(index, 1);
    
    const updatedPool = {
      ...pool,
      subjects: updatedSubjects
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const updateSubjectItem = (index: number, field: string, value: any) => {
    const updatedSubjects = [...pool.subjects];
    
    if (field === 'subjectId') {
      updatedSubjects[index].subjectId = value;
    } else if (field === 'count') {
      updatedSubjects[index].count = parseInt(value, 10);
    }
    
    const updatedPool = {
      ...pool,
      subjects: updatedSubjects
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const updateTotalQuestions = (value: string) => {
    const total = parseInt(value, 10);
    if (isNaN(total) || total < 1) return;
    
    const updatedPool = {
      ...pool,
      totalQuestions: total
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  useEffect(() => {
    if (pool.subjects.length === 0 && subjects.length > 0) {
      const initialSubjectItem: SubjectPoolItem = {
        subjectId: subjects[0].id,
        count: 5
      };
      
      const updatedPool = {
        ...pool,
        subjects: [initialSubjectItem]
      };
      
      setPool(updatedPool);
      onPoolChange(updatedPool);
    }
  }, [subjects]);

  return (
    <div className="space-y-4">
      <PoolHeader
        totalQuestions={pool.totalQuestions}
        availableQuestionCount={availableQuestionCount}
        onTotalQuestionsChange={updateTotalQuestions}
      />

      <SubjectsList
        subjects={subjects}
        poolSubjects={pool.subjects}
        onAddSubject={addSubject}
        onUpdateSubject={updateSubjectItem}
        onRemoveSubject={removeSubject}
      />
    </div>
  );
};

export default QuestionPoolConfig;
