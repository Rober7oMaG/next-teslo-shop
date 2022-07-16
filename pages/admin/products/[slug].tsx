import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, ListItem, Paper, Radio, RadioGroup, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { DeleteOutlineOutlined, DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Swal from 'sweetalert2';
import { AdminLayout } from '../../../components/layouts';
import { IProduct, TValidSize, TValidType } from '../../../interfaces';
import { dbProducts } from '../../../database';
import { tesloApi } from '../../../api';
import { Product } from '../../../models';

const validTypes  = ['shirts','pants','hoodies','hats'];
const validGender = ['men','women','kid','unisex'];
const validSizes = ['XS','S','M','L','XL','XXL','XXXL'];

interface FormData {
    _id?: string;
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: string[];
    slug: string;
    tags: string[];
    title: string;
    type: string;
    gender: string;
}

interface Props {
    product: IProduct;
}

const ProductAdminPage: React.FC<Props> = ({ product }) => {
    console.log({product});
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const {register, handleSubmit, formState: {errors}, getValues, setValue, watch} = useForm<FormData>({
        defaultValues: product
    });

    useEffect(() => {
        const subscription = watch((value, {name, type}) => {
            if (name === 'title') {
                const newSlug = value.title?.trim().replaceAll(' ', '_').replaceAll("'", '').toLocaleLowerCase() || '';
                setValue('slug', newSlug);
            }
        });
        
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    const onSizeChanged = (size: string) => {
        const currentSizes = getValues('sizes');
        if (currentSizes.includes(size)) {
            return setValue('sizes', currentSizes.filter(s => s !== size), {shouldValidate: true});
        }

        setValue('sizes', [...currentSizes, size], {shouldValidate: true});
    };

    const onNewTag = () => {
        const tag = newTag.trim().toLocaleLowerCase();
        setNewTag('');

        const currentTags = getValues('tags');
        if (currentTags.includes(tag)) {
            return;
        }

        currentTags.push(tag);
    };

    const onDeleteTag = (tag: string) => {
        const updatedTags = getValues('tags').filter(t => t !== tag);
        setValue('tags', updatedTags, {shouldValidate: true});
    };

    const onFilesSelected = async(event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        try {
            for (const file of event.target.files) {
                const formData = new FormData();
                formData.append('file', file);

                const {data} = await tesloApi.post<{message: string}>('/admin/upload', formData);
                setValue('images', [...getValues('images'), data.message], {shouldValidate: true});
            }
        } catch (error) {
            console.log({error});
        }
    }

    const onDeleteImage = (image: string) => {
        setValue('images', getValues('images').filter(img => img !== image), {shouldValidate: true});
    };

    
    const onFormSubmit = async(form: FormData) => {
        if (form.images.length < 2) {
            return alert("At least 2 images required.");
        }
        
        setIsSaving(true);
        
        try {
            const {data} = await tesloApi({
                url: '/admin/products',
                method: form._id ? 'PUT' : 'POST',
                data: form
            });
            
            enqueueSnackbar(form._id ? 'Product updated successfully!' : 'Product added successfully!', {
                variant: 'success',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });
            
            if (!form._id) {
                router.replace(`/admin/products/${form.slug}`);
                setIsSaving(false);
            } else {
                setIsSaving(false);
            }
            
        } catch (error) {
            console.log(error);
            setIsSaving(false);
        }
    };
    
    const onDeleteProduct = async() => {
        Swal.fire({
            title: 'Confirm deletion?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm'
          }).then(async (result) => {
            if (result.isConfirmed) {
                const {data} = await tesloApi({
                    url: '/admin/products',
                    method: 'DELETE',
                    data: {
                        _id: product._id,
                        images: product.images
                    }
                });

                enqueueSnackbar('Product deleted!', {
                    variant: 'error',
                    autoHideDuration: 2000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                    }
                });

                router.replace(`/admin/products`);
            }
        })
    };

    return (
        <AdminLayout 
            title={'Product'} 
            subtitle={`Editing: ${ product.title }`}
            icon={ <DriveFileRenameOutline /> }
        >
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button 
                        color='error'
                        startIcon={ <DeleteOutlineOutlined /> }
                        sx={{ width: '150px', mr: 2, display: product.slug ? 'flex' : 'none' }}
                        // disabled={isSaving}
                        onClick={onDeleteProduct}
                    >
                        Delete
                    </Button>
                    <Button 
                        color="secondary"
                        startIcon={ <SaveOutlined /> }
                        sx={{ width: '150px' }}
                        type="submit"
                        disabled={isSaving}
                    >
                        Save
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={ 6 }>
                        <TextField
                            label="Title"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { 
                                ...register('title', {
                                    required: 'Title field is required.',
                                    minLength: { value: 2, message: 'Title has to be at least 2 characters long.' }
                                })
                            }
                            error={ !!errors.title }
                            helperText={ errors.title?.message }
                        />

                        <TextField
                            label="Description"
                            variant="filled"
                            fullWidth 
                            multiline
                            rows={6}
                            sx={{ mb: 1 }}
                            { 
                                ...register('description', {
                                    required: 'Description field is required.',
                                    minLength: { value: 2, message: 'Description has to be at least 2 characters long.' }
                                })
                            }
                            error={ !!errors.description }
                            helperText={ errors.description?.message }
                        />

                        <TextField
                            label="Stock"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { 
                                ...register('inStock', {
                                    required: 'Stock field is required.',
                                    minLength: { value: 0, message: 'At least 0 in stock.' }
                                })
                            }
                            error={ !!errors.inStock }
                            helperText={ errors.inStock?.message }
                        />
                        
                        <TextField
                            label="Price"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { 
                                ...register('price', {
                                    required: 'Price field is required.',
                                    minLength: { value: 0, message: 'At least a price of $0.' }
                                })
                            }
                            error={ !!errors.price }
                            helperText={ errors.price?.message }
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Type</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('type') }
                                onChange={ (event) => setValue('type', event.target.value, {shouldValidate: true})}
                            >
                                {
                                    validTypes.map( option => (
                                        <FormControlLabel 
                                            key={ option }
                                            value={ option }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(option) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Gender</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('gender') }
                                onChange={ (event) => setValue('gender', event.target.value, {shouldValidate: true})}
                            >
                                {
                                    validGender.map( option => (
                                        <FormControlLabel 
                                            key={ option }
                                            value={ option }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(option) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormGroup>
                            <FormLabel>Sizes</FormLabel>
                            {
                                validSizes.map(size => (
                                    <FormControlLabel 
                                        key={size} 
                                        control={<Checkbox checked={getValues('sizes').includes(size)} />} 
                                        label={ size } 
                                        onChange={() => onSizeChanged(size)}
                                    />
                                ))
                            }
                        </FormGroup>
                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={ 6 }>
                        <TextField
                            label="Slug - URL"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            { 
                                ...register('slug', {
                                    required: 'Slug field is required.',
                                    validate: (val) => val.trim().includes(' ') ? "Can't have a white space." : undefined
                                })
                            }
                            error={ !!errors.slug }
                            helperText={ errors.slug?.message }
                        />

                        <TextField
                            label="Tags"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            helperText="Press [spacebar] to add"
                            value={newTag}
                            onChange={(event) => setNewTag(event.target.value)}
                            onKeyUp={(event) => event.code === 'Space' ? onNewTag() : undefined}
                        />
                        
                        <Box 
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                            }}
                            component="ul"
                        >
                            {
                                getValues('tags').map((tag) => {
                                    return (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => onDeleteTag(tag)}
                                            color="primary"
                                            size='small'
                                            sx={{ ml: 1, mt: 1}}
                                        />
                                    );
                                })
                            }
                        </Box>

                        <Divider sx={{ my: 2  }}/>
                        
                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb:1}}>Images</FormLabel>
                            <Button
                                color="secondary"
                                fullWidth
                                startIcon={ <UploadOutlined /> }
                                sx={{ mb: 3 }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Load Image
                            </Button>
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                multiple 
                                accept='images/png, image/gif, image/jpeg' 
                                style={{display: 'none'}}
                                onChange={onFilesSelected}
                            />

                            <Chip 
                                label="Minimum 2 images"
                                color='error'
                                variant='outlined'
                                sx={{ mb: 1, display: getValues('images').length < 2 ? 'flex' : 'none' }}
                            />

                            <Grid container spacing={2}>
                                {
                                    getValues('images').map(img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia 
                                                    component='img'
                                                    className='fadeIn'
                                                    image={img}
                                                    alt={img}
                                                />
                                                <CardActions>
                                                    <Button 
                                                        fullWidth 
                                                        color="error"
                                                        onClick={() => onDeleteImage(img)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { slug = ''} = query;

    let product: IProduct | null;

    if (slug === 'new') {
        const tempProduct = JSON.parse(JSON.stringify(new Product()));
        delete tempProduct._id;
        // tempProduct.images = ['img1.jpg', 'img2.jpg'];
        product = tempProduct;
    } else {
        product = await dbProducts.getProductBySlug(slug.toString());
    }
    
    if (!product) {
        return {
            redirect: {
                destination: '/admin/products',
                permanent: false,
            }
        }
    }

    return {
        props: {
            product
        }
    }
}

export default ProductAdminPage;