import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle, Send, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function ReviewList({
  reviews = [],
  averageRating = 5.0,
  totalReviews = 0,
  onSubmitReview,
  isSubmitting = false,
  isAuthenticated = false,
}) {
  const [selectedFilterStar, setSelectedFilterStar] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [likedReviews, setLikedReviews] = useState({});

  // Compute distribution
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    counts[star] = (counts[star] || 0) + 1;
  });

  const displayTotal = totalReviews || reviews.length;

  // Filter reviews
  const filteredReviews = selectedFilterStar === 0
    ? reviews
    : reviews.filter((r) => Math.round(Number(r.rating)) === selectedFilterStar);

  const handleLike = (reviewId) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onSubmitReview) {
      onSubmitReview({
        rating: newRating,
        comment: newComment.trim(),
      });
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Rating Summary & Histogram */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/90 flex flex-col md:flex-row items-center gap-6">
        {/* Big Overall Rating Number */}
        <div className="flex flex-col items-center justify-center text-center md:border-r md:border-slate-200 md:pr-8 min-w-[150px]">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {Number(averageRating).toFixed(1)}
            <span className="text-base text-slate-400 font-normal"> / 5.0</span>
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {displayTotal} Ulasan Pembeli
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] || 0;
            const pct = displayTotal > 0 ? Math.round((count / displayTotal) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 w-12 text-slate-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{star}</span>
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#03AC0E] h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400 font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedFilterStar(0)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedFilterStar === 0
              ? 'bg-[#03AC0E] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Semua ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelectedFilterStar(star)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilterStar === star
                ? 'bg-[#03AC0E] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{star} ({counts[star] || 0})</span>
          </button>
        ))}
      </div>

      {/* 3. Add Review Form (if authenticated) */}
      {onSubmitReview && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#03AC0E]" />
            Tulis Ulasan Produk
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500 font-medium">Beri Bintang:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1 focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= newRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 ml-1">
              {newRating} / 5
            </span>
          </div>

          <textarea
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isAuthenticated
                ? 'Bagikan pengalaman Anda tentang kualitas barang, kemasan, atau performanya...'
                : 'Masuk ke akun TokoNusa terlebih dahulu untuk mengirim ulasan...'
            }
            disabled={!isAuthenticated || isSubmitting}
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#03AC0E] focus:ring-1 focus:ring-[#03AC0E] mb-2.5 resize-none disabled:bg-slate-50 disabled:text-slate-400"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isAuthenticated || isSubmitting || !newComment.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#03AC0E] hover:bg-[#02930c] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Review Cards List */}
      <div className="divide-y divide-slate-100">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
            Belum ada ulasan untuk filter bintang ini.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const isLiked = Boolean(likedReviews[r.id]);
            return (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#03AC0E] flex items-center justify-center font-bold text-xs uppercase">
                      {r.user_name?.slice(0, 2) || 'TN'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {r.user_name || 'Pembeli Terverifikasi'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                          <CheckCircle className="w-3 h-3" />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Number(r.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.variant_name && (
                  <div className="text-[11px] text-slate-500 font-medium mb-1.5">
                    Varian: <span className="text-slate-700">{r.variant_name}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                  {r.comment}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleLike(r.id)}
                    className={`inline-flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer ${
                      isLiked ? 'text-[#03AC0E] font-bold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Membantu {isLiked ? '(1)' : ''}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
