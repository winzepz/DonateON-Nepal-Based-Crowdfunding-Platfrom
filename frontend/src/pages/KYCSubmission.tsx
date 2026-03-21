import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, FileText, Upload, ShieldCheck, Clock, XCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const KYCSubmission = () => {
    const { token } = useAuth();
    const [documentType, setDocumentType] = useState('citizenship');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('UNVERIFIED');
    const [statusLoading, setStatusLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchStatus();
    }, [token]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/kyc/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data.status);
        } catch (err) {
            console.error('Error fetching KYC status:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('image', image);

        try {
            const res = await axios.post(`${API_BASE_URL}/kyc/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStatus(res.data.status);
            setMessage({ type: 'success', text: 'Documents submitted successfully. Verification is pending.' });
            setImage(null);
            setImagePreview(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit documents' });
        } finally {
            setLoading(false);
        }
    };

    if (statusLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
                                <p className="text-gray-500">Submit your documents to get verified and start fundraising.</p>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`rounded-xl p-4 flex items-center gap-3 ${status === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
                            status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                            {status === 'VERIFIED' && <CheckCircle2 className="h-5 w-5" />}
                            {status === 'PENDING' && <Clock className="h-5 w-5" />}
                            {status === 'REJECTED' && <XCircle className="h-5 w-5" />}
                            {status === 'UNVERIFIED' && <AlertCircle className="h-5 w-5" />}

                            <span className="font-semibold">
                                {status === 'VERIFIED' && 'Your account is verified.'}
                                {status === 'PENDING' && 'Verification is pending. We are reviewing your documents.'}
                                {status === 'REJECTED' && 'Verification rejected. Please re-submit valid documents.'}
                                {status === 'UNVERIFIED' && 'Action Required: Please submit your documents.'}
                            </span>
                        </div>
                    </div>

                    {(status === 'UNVERIFIED' || status === 'REJECTED') && (
                        <div className="p-8">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Document Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setDocumentType('citizenship')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${documentType === 'citizenship'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <FileText className="h-6 w-6" />
                                            <span className="font-medium">Citizenship</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDocumentType('license')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${documentType === 'license'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <FileText className="h-6 w-6" />
                                            <span className="font-medium">Driving License</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Upload Document Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="h-48 rounded-lg shadow-sm" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-medium">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !image}
                                    className="w-full py-3 px-4 rounded-xl text-white bg-primary hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    {loading ? 'Submitting...' : 'Submit Documents'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KYCSubmission;
