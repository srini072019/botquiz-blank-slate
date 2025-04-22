
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, FileText } from "lucide-react";
import { Subject, SubjectFormData } from "@/types/subject.types";
import SubjectForm from "./SubjectForm";
import { useSubjects } from "@/hooks/useSubjects";
import { Course } from "@/types/course.types";

interface SubjectListProps {
  courseId: string;
  courses: Course[];
}

const SubjectList = ({ courseId, courses }: SubjectListProps) => {
  const { subjects, courseSubjects, createSubject, updateSubject, deleteSubject, isLoading, getSubjectsByCourse } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter subjects for this course
  const courseSubjectsList = getSubjectsByCourse(courseId);

  const handleCreateSubject = async (data: SubjectFormData) => {
    // Ensure the current course is included
    if (!data.courseIds.includes(courseId)) {
      data.courseIds.push(courseId);
    }
    
    await createSubject(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSubject = async (data: SubjectFormData) => {
    if (selectedSubject) {
      await updateSubject(selectedSubject.id, data);
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
    // Find all course IDs this subject is associated with
    const subjectCourseIds = courseSubjects
      .filter(cs => cs.subjectId === subject.id)
      .map(cs => cs.courseId);
    
    setSelectedSubject({
      ...subject,
      courses: courses.filter(c => subjectCourseIds.includes(c.id))
    });
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
              initialData={{ 
                title: "", 
                description: "", 
                courseIds: [courseId]
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {courseSubjectsList.length > 0 ? (
          courseSubjectsList.map((subject) => (
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
                courseIds: selectedSubject.courses?.map(c => c.id) || [],
              }}
              courses={courses}
              onSubmit={handleUpdateSubject}
              isSubmitting={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectList;
