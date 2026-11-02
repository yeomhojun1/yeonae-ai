"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("이 분석 기록을 삭제할까요?")) return;
    setDeleting(true);
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/history");
      router.refresh();
    } else {
      alert("삭제에 실패했어요.");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-600 transition-colors duration-150 ease-out hover:border-red-200 hover:text-red-600 disabled:opacity-50"
    >
      <Icon name="trash" className="h-4 w-4" />
      {deleting ? "삭제 중" : "삭제"}
    </button>
  );
}
