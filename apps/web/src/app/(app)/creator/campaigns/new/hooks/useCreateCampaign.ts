import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryOption } from '@/app/(app)/creator/campaigns/components/BasicInfoSection';

export function useCreateCampaign() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [isKycVerified, setIsKycVerified] = useState(false);
    const [isKycCheckLoading, setIsKycCheckLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`)
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to load categories:', err));

        const token = localStorage.getItem('accessToken');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setIsKycVerified(data.isKycVerified || false);
            })
            .catch((err) => {
                console.error('Failed to load user data:', err);
                setIsKycVerified(false);
            })
            .finally(() => {
                setIsKycCheckLoading(false);
            });
    }, []);

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
        const newFiles = [...galleryFiles];
        const newPreviews = [...galleryPreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setGalleryFiles(newFiles);
        setGalleryPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const token = localStorage.getItem('accessToken');

        const fundingGoalAmount = Number(formData.get('fundingGoalAmount'));
        const minimumDonationAmount = Number(formData.get('minimumDonationAmount'));

        if (!fundingGoalAmount || fundingGoalAmount < 1000000) {
            setError('Mục tiêu chiến dịch phải từ 1.000.000 VND trở lên');
            setIsLoading(false);
            return;
        }

        if (!minimumDonationAmount || minimumDonationAmount <= 0) {
            setError('Vui lòng nhập số tiền ủng hộ tối thiểu');
            setIsLoading(false);
            return;
        }

        if (minimumDonationAmount > fundingGoalAmount) {
            setError('Số tiền ủng hộ tối thiểu không được lớn hơn mục tiêu chiến dịch');
            setIsLoading(false);
            return;
        }

        if (!imageFile) {
            setError('Vui lòng chọn ảnh đại diện cho chiến dịch');
            setIsLoading(false);
            return;
        }

        if (!selectedCategoryId) {
            setError('Vui lòng chọn danh mục');
            setIsLoading(false);
            return;
        }

        if (!imageFile) {
            setError('Vui lòng chọn ảnh đại diện');
            setIsLoading(false);
            return;
        }

        if (galleryFiles.length === 0) {
            setError('Vui lòng chọn ít nhất 1 ảnh');
            setIsLoading(false);
            return;
        }

        const todayAtZero = new Date();
        todayAtZero.setHours(0, 0, 0, 0);
        const startVal = new Date(formData.get('startAt') as string);
        const endVal = new Date(formData.get('endAt') as string);

        if (startVal < todayAtZero) {
            setError('Ngày bắt đầu không thể ở quá khứ');
            setIsLoading(false);
            return;
        }

        const oneDayMs = 24 * 60 * 60 * 1000;
        if (endVal.getTime() - startVal.getTime() < oneDayMs) {
            setError('Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày');
            setIsLoading(false);
            return;
        }

        let coverImageUrl = '';
        const galleryUrls: string[] = [];

        try {
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('Failed to upload cover image');
                const uploadData = await uploadResponse.json();
                coverImageUrl = uploadData.url;
            }

            for (const file of galleryFiles) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('Failed to upload gallery images');
                const uploadData = await uploadResponse.json();
                galleryUrls.push(uploadData.url);
            }

            const selectedCat = categories.find((c) => c.id === selectedCategoryId);

            const data = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: selectedCat?.name || '',
                categoryId: selectedCategoryId || undefined,
                locationText: formData.get('locationText') as string,
                coverImageUrl: coverImageUrl,
                galleryUrls: galleryUrls,
                fundingGoalAmount,
                minimumDonationAmount,
                startAt: startVal.toISOString(),
                endAt: endVal.toISOString(),
                autoCloseWhenGoalReached: formData.get('autoCloseWhenGoalReached') === 'on',
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
                throw new Error(errData.message || 'Failed to create campaign');
            }

            router.push('/creator/campaigns');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
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
        router,
        isKycVerified,
        isKycCheckLoading
    };
}
