import { createSignal, type Component } from 'solid-js';
import { createForm, valiForm, reset } from '@modular-forms/solid';
import * as v from 'valibot';
import { Portal } from 'solid-js/web';
import { useAuth } from '../../../lib/auth';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import * as Field from '@/components/ui/field';
import * as Fieldset from '@/components/ui/fieldset';
import { Stack } from 'styled-system/jsx';

// Valibot Schema
const AddLocationSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(1, 'Name is required'),
        v.maxLength(255, 'Name must be less than 255 characters')
    ),
    description: v.optional(v.string()),
});

type AddLocationForm = v.InferInput<typeof AddLocationSchema>;

interface AddLocationDialogProps {
    onSuccess: () => void;
}

export const AddLocationDialog: Component<AddLocationDialogProps> = (componentProps) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const { fetchWithAuth } = useAuth();

    const [form, { Form, Field: FormField }] = createForm<AddLocationForm>({
        validate: valiForm(AddLocationSchema),
        initialValues: {
            name: '',
            description: '',
        },
    });

    const handleSubmit = async (values: AddLocationForm) => {
        try {
            const response = await fetchWithAuth('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    description: values.description || null,
                }),
            });

            if (response.ok) {
                setIsOpen(false);
                componentProps.onSuccess();
                // Reset form
                reset(form);
            }
        } catch (error) {
            console.error('Failed to create location:', error);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Location</Button>
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
                                        Add New Location
                                    </Text>
                                    <Text textStyle="sm" color="fg.muted">
                                        Create a new location for organizing your items
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
                                                                placeholder="Location name"
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
                                            </Stack>
                                        </Fieldset.Content>
                                    </Fieldset.Root>
                                </Dialog.Body>

                                <Dialog.Footer style={{ "margin-top": '1.5rem' }}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={form.submitting}>
                                        {form.submitting ? "Creating..." : "Create Location"}
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
