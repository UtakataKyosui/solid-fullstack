import { createSignal, For, type Component } from 'solid-js';
import { createForm, valiForm, reset } from '@modular-forms/solid';
import * as v from 'valibot';
import { Portal } from 'solid-js/web';
import { useAuth } from '../../../lib/auth';
import type { Genre, Location } from '../../../lib/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import * as Field from '@/components/ui/field';
import * as Fieldset from '@/components/ui/fieldset';
import { Stack } from 'styled-system/jsx';
import { css } from 'styled-system/css';

// Valibot Schema
const AddItemSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(1, 'Name is required'),
        v.maxLength(255, 'Name must be less than 255 characters')
    ),
    description: v.optional(v.string()),
    genreId: v.pipe(
        v.string(),
        v.minLength(1, 'Genre is required')
    ),
    locationId: v.string(), // 'unassigned' is valid
});

type AddItemForm = v.InferInput<typeof AddItemSchema>;

interface AddItemDialogProps {
    genres: Genre[];
    locations: Location[];
    onSuccess: () => void;
}

export const AddItemDialog: Component<AddItemDialogProps> = (componentProps) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const { fetchWithAuth } = useAuth();

    const [form, { Form, Field: FormField }] = createForm<AddItemForm>({
        validate: valiForm(AddItemSchema),
        initialValues: {
            name: '',
            description: '',
            genreId: '',
            locationId: '0',  // id=0のUnassignedロケーション
        },
    });

    const handleSubmit = async (values: AddItemForm) => {
        console.log('handleSubmit called', values);
        try {
            const response = await fetchWithAuth('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    description: values.description || null,
                    genre_id: parseInt(values.genreId as string),
                    location_id: parseInt(values.locationId as string),
                }),
            });

            console.log('Response:', response.ok);
            if (response.ok) {
                console.log('Closing dialog...');
                setIsOpen(false);
                componentProps.onSuccess();
                // Reset form
                reset(form);
            }
        } catch (error) {
            console.error('Failed to create item:', error);
        }
    };

    const handleCancel = () => {
        console.log('Cancel clicked, closing dialog...');
        setIsOpen(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Item</Button>
            <Dialog.Root
                open={isOpen()}
                onOpenChange={(e) => setIsOpen(e.open)}
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
                                        Add New Item
                                    </Text>
                                    <Text textStyle="sm" color="fg.muted">
                                        Create a new item to track in your inventory
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
                                                                Name
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                {...fieldProps}
                                                                value={field.value || ''}
                                                                placeholder="Item name"
                                                            />
                                                            <Field.ErrorText>{field.error}</Field.ErrorText>
                                                        </Field.Root>
                                                    )}
                                                </FormField>

                                                <FormField name="description">
                                                    {(field, fieldProps) => (
                                                        <Field.Root>
                                                            <Field.Label>Description</Field.Label>
                                                            <Input
                                                                {...fieldProps}
                                                                value={field.value || ''}
                                                                placeholder="Optional description"
                                                            />
                                                        </Field.Root>
                                                    )}
                                                </FormField>

                                                <FormField name="genreId">
                                                    {(field, fieldProps) => (
                                                        <Field.Root required invalid={!!field.error}>
                                                            <Field.Label>
                                                                Genre
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <select
                                                                {...fieldProps}
                                                                value={field.value || ''}
                                                                class={css({
                                                                    w: 'full',
                                                                    h: '10',
                                                                    px: '3',
                                                                    rounded: 'md',
                                                                    bg: 'bg.default',
                                                                    borderWidth: '1px',
                                                                    borderColor: 'border.default',
                                                                    color: 'fg.default',
                                                                    fontSize: 'sm',
                                                                    _focus: { outlineColor: 'blue.500' }
                                                                })}
                                                            >
                                                                <option value="">Select a genre</option>
                                                                <For each={componentProps.genres}>
                                                                    {(genre) => <option value={genre.id}>{genre.name}</option>}
                                                                </For>
                                                            </select>
                                                            <Field.ErrorText>{field.error}</Field.ErrorText>
                                                        </Field.Root>
                                                    )}
                                                </FormField>

                                                <FormField name="locationId">
                                                    {(field, fieldProps) => (
                                                        <Field.Root>
                                                            <Field.Label>Initial Location</Field.Label>
                                                            <select
                                                                {...fieldProps}
                                                                value={field.value || 'unassigned'}
                                                                class={css({
                                                                    w: 'full',
                                                                    h: '10',
                                                                    px: '3',
                                                                    rounded: 'md',
                                                                    bg: 'bg.default',
                                                                    borderWidth: '1px',
                                                                    borderColor: 'border.default',
                                                                    color: 'fg.default',
                                                                    fontSize: 'sm',
                                                                    _focus: { outlineColor: 'blue.500' }
                                                                })}
                                                            >
                                                                <For each={componentProps.locations}>
                                                                    {(location) => <option value={location.id}>{location.name}</option>}
                                                                </For>
                                                            </select>
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
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={form.submitting}>
                                        {form.submitting ? "Creating..." : "Create Item"}
                                    </Button>
                                </Dialog.Footer>
                            </Form>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
