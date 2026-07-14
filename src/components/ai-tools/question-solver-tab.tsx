"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuestionSolver } from "@/hooks/use-question-solver";
import { ChatPanel } from "@/components/ai-tools/chat-panel";

export function QuestionSolverTab() {
  const [question, setQuestion] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const { solveQuestion, isSolving } = useQuestionSolver();
  const [hasSolved, setHasSolved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const result = await solveQuestion({ question, subject: subject || undefined });
    if (result) {
      setQuestion("");
      setSubject("");
      setHasSolved(true);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Question Solver</CardTitle>
              <CardDescription>
                Get a step-by-step solution to an academic question.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="Data Structures"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Explain how quicksort works and its time complexity..."
                className="min-h-24"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <Button type="submit" variant="brand" disabled={!question.trim() || isSolving}>
              {isSolving && <Loader2 className="size-4 animate-spin" />}
              Solve
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSolved && (
        <ChatPanel
          type="QUESTION_SOLVER"
          emptyStateTitle="Your solved questions"
          emptyStateDescription="Solutions appear here, and you can ask follow-up questions in the same thread."
          inputPlaceholder="Ask a follow-up..."
        />
      )}
    </div>
  );
}
