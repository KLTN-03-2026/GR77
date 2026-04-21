import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryOption } from '@/app/(app)/creator/campaigns/components/BasicInfoSection';

export function useEditCampaign(id: string) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + galleryPreviews.length > 5) {
            setError('Maximum 5 gallery images allowed');
            return;
        }
        const newFiles = [...galleryFiles];
        const newPreviews = [...galleryPreviews];
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) return;
            newFiles.push(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                setGalleryPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        setGalleryFiles(newFiles);
    };

    const removeGalleryImage = (index: number) => {
        const previewToRemove = galleryPreviews[index];
        const newPreviews = [...galleryPreviews];
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);

        if (previewToRemove.startsWith('data:')) {
            setGalleryFiles(prev => {
                const updated = [...prev];
                const fileIndex = index - galleryPreviews.filter(p => !p.startsWith('data:')).length;
                if (fileIndex >= 0) updated.splice(fileIndex, 1);
                return updated;
            });
        }
    };

    useEffect(() => {
        if (campaign?.coverImageUrl) {
            setImagePreview(campaign.coverImageUrl);
        }
    }, [campaign]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const [campaignRes, categoriesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`),
                ]);

                if (!campaignRes.ok) {
                    if (campaignRes.status === 401) {
                        localStorage.removeItem('accessToken');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch campaign details');
                }

                const campaignData = await campaignRes.json();
                setCampaign(campaignData);
                if (campaignData.images && Array.isArray(campaignData.images)) {
                    setGalleryPreviews(campaignData.images.map((img: any) => img.url));
                }

                if (categoriesRes.ok) {
                    const catsData = await categoriesRes.json();
                    setCategories(catsData);
                    if (campaignData.categoryId) {
                        setSelectedCategoryId(campaignData.categoryId);
                    } else if (campaignData.category) {
                        const match = catsData.find((c: CategoryOption) => c.name.toLowerCase() === campaignData.category.toLowerCase());
                        if (match) setSelectedCategoryId(match.id);
                    }
                }
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message || 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const token = localStorage.getItem('accessToken');

        const isLocked = campaign?.id ? (
            (campaign.currentAmount > 0) ||
            (campaign.startAt && new Date(campaign.startAt) <= new Date())
        ) : false;

        const fundingGoalAmount = formData.get('fundingGoalAmount')
            ? Number(formData.get('fundingGoalAmount'))
            : campaign?.fundingGoalAmount;

        const minimumDonationAmount = formData.get('minimumDonationAmount')
            ? Number(formData.get('minimumDonationAmount'))
            : campaign?.minimumDonationAmount;

        if (!fundingGoalAmount || fundingGoalAmount < 1000000) {
            setError('Mục tiêu chiến dịch phải từ 1.000.000 VND trở lên');
            setIsSaving(false);
            return;
        }

        if (!minimumDonationAmount || minimumDonationAmount <= 0) {
            setError('Vui lòng nhập số tiền ủng hộ tối thiểu');
            setIsSaving(false);
            return;
        }

        if (minimumDonationAmount > fundingGoalAmount) {
            setError('Số tiền ủng hộ tối thiểu không được lớn hơn mục tiêu chiến dịch');
            setIsSaving(false);
            return;
        }

        if (!selectedCategoryId) {
            setError('Vui lòng chọn danh mục');
            setIsSaving(false);
            return;
        }

        if (!imageFile && !campaign?.coverImageUrl) {
            setError('Vui lòng chọn ảnh đại diện');
            setIsSaving(false);
            return;
        }

        if (galleryFiles.length === 0 && galleryPreviews.length === 0) {
            setError('Vui lòng chọn ít nhất 1 ảnh');
            setIsSaving(false);
            return;
        }


        const startAtStr = formData.get('startAt') as string;
        const endAtStr = formData.get('endAt') as string;

        const finalStartAt = startAtStr ? new Date(startAtStr) : (campaign?.startAt ? new Date(campaign.startAt) : null);
        const finalEndAt = endAtStr ? new Date(endAtStr) : (campaign?.endAt ? new Date(campaign.endAt) : null);

        if (finalStartAt && finalEndAt) {
            const todayAtZero = new Date();
            todayAtZero.setHours(0, 0, 0, 0);

            // 1. Kiểm tra ngày bắt đầu không được ở quá khứ (chỉ áp dụng nếu ngày bắt đầu bị thay đổi và chiến dịch chưa bắt đầu)
            const originalStartAt = campaign?.startAt ? new Date(campaign.startAt) : null;
            const isStartAtChanged = startAtStr && originalStartAt && finalStartAt.getTime() !== originalStartAt.getTime();
            const hasStarted = originalStartAt && originalStartAt <= todayAtZero;

            if (isStartAtChanged && !hasStarted && finalStartAt < todayAtZero) {
                setError('Ngày bắt đầu không được ở quá khứ');
                setIsSaving(false);
                return;
            }

            // 2. Quan trọng: Kiểm tra ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (finalEndAt.getTime() - finalStartAt.getTime() < oneDayMs) {
                setError('Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày');
                setIsSaving(false);
                return;
            }
        }

        let coverImageUrl = campaign?.coverImageUrl || '';

        if (imageFile) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadResponse.json();
                coverImageUrl = uploadData.url;
            } catch (err: any) {
                setError('Failed to upload image: ' + err.message);
                setIsSaving(false);
                return;
            }
        } else if (!imagePreview) {
            coverImageUrl = '';
        }

        const finalGalleryUrls = [...galleryPreviews.filter(url => !url.startsWith('data:'))];
        for (const file of galleryFiles) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
                    method: 'POST',
                    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                    body: uploadFormData,
                });
                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    finalGalleryUrls.push(uploadData.url);
                }
            } catch (err) {
                console.error("Gallery upload error", err);
            }
        }

        const title = formData.get('title') 
            ? formData.get('title') as string 
            : campaign?.title;

        const description = formData.get('description') as string;

        if (!title || !description) {
            setError('Title and Description are required');
            setIsSaving(false);
            return;
        }

        const selectedCat = categories.find((c) => c.id === selectedCategoryId);

        const data = {
            title,
            description,
            category: selectedCat?.name || formData.get('category') as string,
            categoryId: selectedCategoryId || undefined,
            locationText: formData.get('locationText') as string,
            coverImageUrl: coverImageUrl,
            galleryUrls: finalGalleryUrls,
            fundingGoalAmount: fundingGoalAmount,
            minimumDonationAmount: minimumDonationAmount,
            startAt: formData.get('startAt') ? new Date(formData.get('startAt') as string).toISOString() : campaign?.startAt,
            endAt: formData.get('endAt') ? new Date(formData.get('endAt') as string).toISOString() : campaign?.endAt,
            autoCloseWhenGoalReached: formData.get('autoCloseWhenGoalReached') === 'on',
        };

        try {
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    router.push('/login');
                    return;
                }
                const errData = await response.json().catch(() => ({}));
                console.error('Update failed:', response.status, errData);
                throw new Error(errData.message || `Error ${response.status}: Failed to update campaign`);
            }

            router.push('/creator/campaigns');
            router.refresh();
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        error,
        campaign,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        imagePreview,
        fileInputRef,
        removeImage,
        handleImageChange,
        galleryPreviews,
        galleryInputRef,
        removeGalleryImage,
        handleGalleryChange,
        handleSubmit,
        router
    };
}
