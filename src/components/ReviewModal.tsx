import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [roleTitle, setRoleTitle] = useState('B.Tech CS Student · Placed');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;

    setSubmitting(true);
    try {
      await api.submitReview({
        name: user?.name || 'TalentAI Candidate',
        role: roleTitle,
        rating,
        review,
        avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReview('');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold">
                Share Your Experience
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                Your feedback inspires fellow candidates and recruiters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Thank You!</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Your review has been published and featured on TalentAI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-space-md space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <span
                      className="material-symbols-outlined text-[30px]"
                      style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
                <span className="ml-2 font-title-md text-title-md text-on-surface font-semibold">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Role / Headline */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Role / College Tag
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. B.Tech CS · Placed at Amazon"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Your Review
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                rows={4}
                placeholder="How did the mock interviews, proctoring, or ATS analyzer help your preparation?"
                className="w-full p-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !review.trim()}
                className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary font-title-md text-sm font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
