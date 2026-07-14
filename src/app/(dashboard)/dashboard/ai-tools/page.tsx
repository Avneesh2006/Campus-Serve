"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AiChatTab,
  PdfSummarizerTab,
  StudyPlannerTab,
  AttendancePredictorTab,
  QuestionSolverTab,
} from "@/components/ai-tools";

export default function AiToolsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Study Tools</h1>
        <p className="text-muted-foreground">
          Chat with an AI assistant, summarize PDFs, plan your studying, predict
          attendance outcomes, and solve questions.
        </p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="w-full flex-wrap sm:w-auto">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="pdf-summarizer">PDF Summarizer</TabsTrigger>
          <TabsTrigger value="study-planner">Study Planner</TabsTrigger>
          <TabsTrigger value="attendance-predictor">Attendance Predictor</TabsTrigger>
          <TabsTrigger value="question-solver">Question Solver</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <AiChatTab />
        </TabsContent>

        <TabsContent value="pdf-summarizer" className="mt-4">
          <PdfSummarizerTab />
        </TabsContent>

        <TabsContent value="study-planner" className="mt-4">
          <StudyPlannerTab />
        </TabsContent>

        <TabsContent value="attendance-predictor" className="mt-4">
          <AttendancePredictorTab />
        </TabsContent>

        <TabsContent value="question-solver" className="mt-4">
          <QuestionSolverTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
