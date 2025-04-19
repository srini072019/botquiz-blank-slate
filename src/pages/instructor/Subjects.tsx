import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SubjectForm from "@/components/subject/SubjectForm";
import { useSubjects } from "@/hooks/useSubjects";
import { useCourses } from "@/hooks/useCourses";
import { SubjectFormData } from "@/types/subject.types";

const InstructorSubjects = () => {
  const { courses } = useCourses("instructor-1"); // Will use actual instructor ID
  const { subjects, createSubject, updateSubject, deleteSubject, isLoading, fetchSubjects } = useSubjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);

  const instructorSubjects = subjects;

  // Explicitly fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Group subjects by course
  const subjectsByCourse = instructorSubjects.reduce((acc, subject) => {
    const courseId = subject.courseId;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(subject);
    return acc;
  }, {} as Record<string, typeof subjects>);

  const handleCreateSubject = async (data: SubjectFormData) => {
    await createSubject(data);
    setIsDialogOpen(false);
  };

  const handleEditSubject = (subjectId: string) => {
    setEditSubjectId(subjectId);
  };

  const handleUpdateSubject = async (data: SubjectFormData) => {
    if (editSubjectId) {
      await updateSubject(editSubjectId, data);
      setEditSubjectId(null);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      await deleteSubject(subjectId);
    }
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subjects</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={18} />
                <span>Create Subject</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new subject.
                </DialogDescription>
              </DialogHeader>
              <SubjectForm
                courses={courses}
                onSubmit={handleCreateSubject}
                isSubmitting={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {courses.length > 0 ? (
            Object.entries(subjectsByCourse).map(([courseId, courseSubjects]) => {
              const course = courses.find(c => c.id === courseId);
              return (
                <Card key={courseId}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">{course?.title || "Unknown Course"}</h2>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {courseSubjects.length > 0 ? (
                      <ul className="divide-y">
                        {courseSubjects.map(subject => (
                          <li key={subject.id} className="py-3 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{subject.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-1">{subject.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditSubject(subject.id)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteSubject(subject.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No subjects in this course yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">You need to create courses first before adding subjects</p>
                <Button onClick={() => window.location.href = '/instructor/courses'}>
                  Go to Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Subject Dialog */}
      {editSubjectId && (
        <Dialog open={!!editSubjectId} onOpenChange={(open) => !open && setEditSubjectId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the details of this subject.
              </DialogDescription>
            </DialogHeader>
            <SubjectForm
              initialData={{
                ...subjects.find(s => s.id === editSubjectId)!,
              }}
              courses={courses}
              onSubmit={handleUpdateSubject}
              isSubmitting={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </InstructorLayout>
  );
};

export default InstructorSubjects;
