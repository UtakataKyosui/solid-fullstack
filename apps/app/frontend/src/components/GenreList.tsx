import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For } from 'solid-js';
import { useAuth } from '../lib/auth';
import type { Genre } from '../lib/types';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Trash2, Edit2, Plus } from 'lucide-solid';
import { addToast } from './ui/Toast';

const GenreList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingGenre, setEditingGenre] = createSignal<Genre | null>(null);
    const [formData, setFormData] = createSignal({ name: '', color: '#000000' });

    const [genres, { refetch }] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres/');
        if (!res.ok) return [];
        return res.json();
    });

    const openAddDialog = () => {
        setEditingGenre(null);
        setFormData({ name: '', color: '#000000' });
        setDialogOpen(true);
    };

    const openEditDialog = (genre: Genre) => {
        setEditingGenre(genre);
        setFormData({ name: genre.name, color: genre.color });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const data = formData();

        if (!data.name.trim()) {
            addToast('error', 'ジャンル名を入力してください');
            return;
        }

        try {
            if (editingGenre()) {
                const res = await fetchWithAuth(`/api/genres/${editingGenre()!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', 'ジャンルの更新に失敗しました');
                    return;
                }

                addToast('success', 'ジャンルを更新しました');
            } else {
                const res = await fetchWithAuth('/api/genres/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', 'ジャンルの作成に失敗しました');
                    return;
                }

                addToast('success', 'ジャンルを作成しました');
            }

            setDialogOpen(false);
            refetch();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('このジャンルを削除しますか？')) return;

        try {
            const res = await fetchWithAuth(`/api/genres/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                addToast('error', 'ジャンルの削除に失敗しました');
                return;
            }

            addToast('success', 'ジャンルを削除しました');
            refetch();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    return (
        <div class="space-y-4 sm:space-y-6">
            <div class="flex justify-between items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-bold">ジャンル管理</h2>
                <Button onClick={openAddDialog} class="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2">
                    <Plus size={18} class="sm:w-5 sm:h-5" />
                    <span class="hidden xs:inline">新規</span>
                </Button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <For each={genres()} fallback={<div class="text-slate-400">ジャンルがありません</div>}>
                    {(genre) => (
                        <div class="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <div
                                        class="w-5 h-5 sm:w-6 sm:h-6 rounded flex-shrink-0"
                                        style={{ 'background-color': genre.color }}
                                    />
                                    <h3 class="font-semibold text-base sm:text-lg truncate">{genre.name}</h3>
                                </div>
                                <div class="flex gap-1 sm:gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => openEditDialog(genre)}
                                        class="p-1.5 sm:p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                                        title="編集"
                                    >
                                        <Edit2 size={14} class="sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(genre.id)}
                                        class="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 size={14} class="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                            <div class="text-xs text-slate-500">
                                作成日: {new Date(genre.created_at).toLocaleDateString('ja-JP')}
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <Show when={dialogOpen()}>
                <Dialog isOpen={true} title={editingGenre() ? 'ジャンル編集' : '新規ジャンル'} onClose={() => setDialogOpen(false)}>
                    <form onSubmit={handleSubmit} class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">名前</label>
                            <Input
                                type="text"
                                value={formData().name}
                                onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">カラー</label>
                            <input
                                type="color"
                                value={formData().color}
                                onInput={(e) => setFormData({ ...formData(), color: e.currentTarget.value })}
                                class="w-full h-10 rounded border border-slate-600 bg-slate-700"
                            />
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button type="submit">
                                {editingGenre() ? '更新' : '作成'}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Show>
        </div>
    );
};

export default GenreList;
