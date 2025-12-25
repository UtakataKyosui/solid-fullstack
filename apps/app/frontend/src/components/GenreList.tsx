import type { Component } from 'solid-js';
import { createResource, createSignal, For } from 'solid-js';
import { createForm, valiForm, reset } from '@modular-forms/solid';
import * as v from 'valibot';
import { Portal } from 'solid-js/web';
import { useAuth } from '../lib/auth';
import type { Genre } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import * as Field from '@/components/ui/field';
import * as Fieldset from '@/components/ui/fieldset';
import { Trash2, Edit2, Plus } from 'lucide-solid';
import { addToast } from '@/components/ui/toast';
import { css } from 'styled-system/css';
import { Stack, Grid, Box, Flex } from 'styled-system/jsx';

// Valibot Schema
const GenreSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(1, 'Genre name is required'),
        v.maxLength(100, 'Genre name must be less than 100 characters')
    ),
    color: v.pipe(
        v.string(),
        v.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    ),
});

type GenreForm = v.InferInput<typeof GenreSchema>;

const GenreList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingGenre, setEditingGenre] = createSignal<Genre | null>(null);

    const [genres, { refetch }] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres');
        if (!res.ok) return [];
        return res.json();
    });

    const [genreForm, { Form, Field: FormField }] = createForm<GenreForm>({
        validate: valiForm(GenreSchema),
        initialValues: {
            name: '',
            color: '#000000',
        },
    });

    const openAddDialog = () => {
        setEditingGenre(null);
        reset(genreForm, {
            initialValues: {
                name: '',
                color: '#000000',
            },
        });
        setDialogOpen(true);
    };

    const openEditDialog = (genre: Genre) => {
        setEditingGenre(genre);
        reset(genreForm, {
            initialValues: {
                name: genre.name,
                color: genre.color,
            },
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (values: GenreForm) => {
        try {
            const url = editingGenre()
                ? `/api/genres/${editingGenre()!.id}`
                : '/api/genres';
            const method = editingGenre() ? 'PUT' : 'POST';

            const res = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                setDialogOpen(false);
                refetch();
                addToast('success', editingGenre() ? 'ジャンルを更新しました' : 'ジャンルを作成しました');
            }
        } catch (error) {
            console.error('Failed to save genre:', error);
            addToast('error', 'ジャンルの保存に失敗しました');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('本当にこのジャンルを削除しますか?')) return;

        try {
            const res = await fetchWithAuth(`/api/genres/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                refetch();
                addToast('success', 'ジャンルを削除しました');
            }
        } catch (error) {
            console.error('Failed to delete genre:', error);
            addToast('error', 'ジャンルの削除に失敗しました');
        }
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb="4">
                <h2 class={css({ fontSize: 'xl', fontWeight: 'bold' })}>Genres</h2>
                <Button onClick={openAddDialog} size="sm">
                    <Plus size={16} />
                    Add Genre
                </Button>
            </Flex>

            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="4">
                <For each={genres()}>
                    {(genre) => (
                        <Box
                            p="4"
                            bg="bg.subtle"
                            rounded="lg"
                            borderWidth="1px"
                            borderColor="border.default"
                        >
                            <Flex justify="space-between" align="start">
                                <Box flex="1">
                                    <Flex align="center" gap="2" mb="2">
                                        <Box
                                            w="4"
                                            h="4"
                                            rounded="full"
                                            style={{ 'background-color': genre.color }}
                                        />
                                        <h3 class={css({ fontSize: 'md', fontWeight: 'medium', color: 'fg.default' })}>
                                            {genre.name}
                                        </h3>
                                    </Flex>
                                </Box>
                                <Flex gap="2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(genre)}
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(genre.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </Flex>
                            </Flex>
                        </Box>
                    )}
                </For>
            </Grid>

            <Dialog.Root
                open={dialogOpen()}
                onOpenChange={(e) => setDialogOpen(e.open)}
                closeOnInteractOutside={true}
                closeOnEscape={true}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.CloseTrigger />
                            <Dialog.Header>
                                <Stack gap="2">
                                    <Text textStyle="xl" fontWeight="bold">
                                        {editingGenre() ? 'ジャンルを編集' : 'ジャンルを作成'}
                                    </Text>
                                    <Text textStyle="sm" color="fg.muted">
                                        {editingGenre()
                                            ? 'ジャンル情報を編集します'
                                            : '新しいジャンルを作成します'}
                                    </Text>
                                </Stack>
                            </Dialog.Header>

                            <Form onSubmit={(values) => handleSubmit(values)}>
                                <Dialog.Body>
                                    <Fieldset.Root>
                                        <Fieldset.Content>
                                            <Stack gap="4">
                                                <FormField name="name">
                                                    {(field, fieldProps) => (
                                                        <Field.Root required invalid={!!field.error}>
                                                            <Field.Label>
                                                                ジャンル名
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                {...fieldProps}
                                                                value={field.value || ''}
                                                                placeholder="例: 本、ゲーム、衣類"
                                                            />
                                                            <Field.ErrorText>{field.error}</Field.ErrorText>
                                                        </Field.Root>
                                                    )}
                                                </FormField>

                                                <FormField name="color">
                                                    {(field, fieldProps) => (
                                                        <Field.Root required invalid={!!field.error}>
                                                            <Field.Label>
                                                                カラー
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                {...fieldProps}
                                                                type="color"
                                                                value={field.value || '#000000'}
                                                            />
                                                            <Field.ErrorText>{field.error}</Field.ErrorText>
                                                        </Field.Root>
                                                    )}
                                                </FormField>
                                            </Stack>
                                        </Fieldset.Content>
                                    </Fieldset.Root>
                                </Dialog.Body>

                                <Dialog.Footer style={{ "margin-top": '1.5rem' }}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        キャンセル
                                    </Button>
                                    <Button type="submit" loading={genreForm.submitting}>
                                        {genreForm.submitting
                                            ? '保存中...'
                                            : editingGenre()
                                                ? '更新'
                                                : '作成'}
                                    </Button>
                                </Dialog.Footer>
                            </Form>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
};

export default GenreList;
