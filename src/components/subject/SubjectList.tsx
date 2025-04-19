
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, FileText } from "lucide-react";
import { Subject } from "@/types/subject.types";
import SubjectForm from "./SubjectForm";
import { useSubjects } from "@/hooks/useSubjects";
import { Course } from "@/types/course.types";

interface SubjectListProps {
  courseId: string;
  courses: Course[];
}

const SubjectList = ({ courseId, courses }: SubjectListProps) => {
  const { subjects: allSubjects, createSubject, updateSubject, deleteSubject, isLoading } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter subjects for this course
  const subjects = allSubjects.filter(subject => subject.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const handleCreateSubject = async (data: any) => {
    await createSubject({
      ...data,
      courseId,
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSubject = async (data: any) => {
    if (selectedSubject) {
      await updateSubject(selectedSubject.id, {
        ...data,
        courseId: selectedSubject.courseId,
      });
      setIsEditDialogOpen(false);
      setSelectedSubject(null);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      await deleteSubject(id);
    }
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subjects</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus size={16} />
              <span>Add Subject</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject for your course.
              </DialogDescription>
            </DialogHeader>
            <SubjectForm 
              courses={courses}
              onSubmit={handleCreateSubject}
              isSubmitting={isLoading}
              courseIdFixed={true}
              initialData={{ 
                title: "", 
                description: "", 
                courseId 
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{subject.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/instructor/subjects/${subject.id}`}>
                        <FileText size={16} />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(subject)}>
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{subject.description}</CardDescription>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              No subjects found. Create your first subject.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the details of this subject.
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <SubjectForm 
              initialData={{
                title: selectedSubject.title,
                description: selectedSubject.description,
                courseId: selectedSubject.courseId,
              }}
              courses={courses}
              onSubmit={handleUpdateSubject}
              isSubmitting={isLoading}
              courseIdFixed={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectList;
