"use client";

import * as React from "react";
import { Plus, Trash2, Loader2, Download, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  Resume,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeProjectItem,
} from "@/hooks/use-resumes";

interface FormState {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: ResumeEducationItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  skills: string[];
}

function toFormState(resume: Resume): FormState {
  return {
    title: resume.title,
    fullName: resume.fullName ?? "",
    email: resume.email ?? "",
    phone: resume.phone ?? "",
    location: resume.location ?? "",
    summary: resume.summary ?? "",
    education: resume.education,
    experience: resume.experience,
    projects: resume.projects,
    skills: resume.skills,
  };
}

export function ResumeBuilderForm({
  resume,
  onSave,
}: {
  resume: Resume;
  onSave: (data: FormState) => Promise<unknown>;
}) {
  const [form, setForm] = React.useState<FormState>(() => toFormState(resume));
  const [skillInput, setSkillInput] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(toFormState(resume));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(form);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport() {
    const { exportResumeToPdf } = await import("@/lib/resume-pdf");
    exportResumeToPdf({
      ...resume,
      ...form,
    });
  }

  function addEducation() {
    setForm((f) => ({
      ...f,
      education: [...f.education, { school: "", degree: "", startYear: "", endYear: "", notes: "" }],
    }));
  }

  function updateEducation(index: number, patch: Partial<ResumeEducationItem>) {
    setForm((f) => ({
      ...f,
      education: f.education.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }

  function removeEducation(index: number) {
    setForm((f) => ({ ...f, education: f.education.filter((_, i) => i !== index) }));
  }

  function addExperience() {
    setForm((f) => ({
      ...f,
      experience: [
        ...f.experience,
        { company: "", role: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  }

  function updateExperience(index: number, patch: Partial<ResumeExperienceItem>) {
    setForm((f) => ({
      ...f,
      experience: f.experience.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }

  function removeExperience(index: number) {
    setForm((f) => ({ ...f, experience: f.experience.filter((_, i) => i !== index) }));
  }

  function addProject() {
    setForm((f) => ({
      ...f,
      projects: [...f.projects, { name: "", description: "", link: "", techStack: "" }],
    }));
  }

  function updateProject(index: number, patch: Partial<ResumeProjectItem>) {
    setForm((f) => ({
      ...f,
      projects: f.projects.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  function removeProject(index: number) {
    setForm((f) => ({ ...f, projects: f.projects.filter((_, i) => i !== index) }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact details</CardTitle>
          <CardDescription>This appears at the top of your resume.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resumeTitle">Resume title (for your reference)</Label>
            <Input
              id="resumeTitle"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="A short 2-3 sentence pitch about yourself..."
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Education</CardTitle>
              <CardDescription>Your academic background.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addEducation}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.education.length === 0 && (
            <p className="text-sm text-muted-foreground">No education entries yet.</p>
          )}
          {form.education.map((edu, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Entry {i + 1}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => removeEducation(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) => updateEducation(i, { school: e.target.value })}
                />
                <Input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducation(i, { degree: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Start year"
                  value={edu.startYear}
                  onChange={(e) => updateEducation(i, { startYear: e.target.value })}
                />
                <Input
                  placeholder="End year"
                  value={edu.endYear}
                  onChange={(e) => updateEducation(i, { endYear: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Notes (optional)"
                value={edu.notes}
                onChange={(e) => updateEducation(i, { notes: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Experience</CardTitle>
              <CardDescription>Internships, jobs, or work experience.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addExperience}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.experience.length === 0 && (
            <p className="text-sm text-muted-foreground">No experience entries yet.</p>
          )}
          {form.experience.map((exp, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Entry {i + 1}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => removeExperience(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) => updateExperience(i, { role: e.target.value })}
                />
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(i, { company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Start date"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                />
                <Input
                  placeholder="End date"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(i, { endDate: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="What did you work on?"
                value={exp.description}
                onChange={(e) => updateExperience(i, { description: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Projects</CardTitle>
              <CardDescription>Personal or academic projects.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addProject}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
          {form.projects.map((proj, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Project {i + 1}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => removeProject(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Project name"
                value={proj.name}
                onChange={(e) => updateProject(i, { name: e.target.value })}
              />
              <Input
                placeholder="Tech stack (comma separated)"
                value={proj.techStack}
                onChange={(e) => updateProject(i, { techStack: e.target.value })}
              />
              <Input
                placeholder="Link (optional)"
                value={proj.link}
                onChange={(e) => updateProject(i, { link: e.target.value })}
              />
              <Textarea
                placeholder="What does it do?"
                value={proj.description}
                onChange={(e) => updateProject(i, { description: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
          <CardDescription>Add relevant technical and soft skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. Python, Communication"
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4" />
          Export as PDF
        </Button>
        <Button variant="brand" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save resume
        </Button>
      </div>
    </div>
  );
}
