import React from "react";

export default function hey() {
  return (
    <div>
      <div class="yt-wrap">
        <div class="yt-card">
          <div class="yt-badge">▶ YOUTUBE EXCLUSIVE</div>

          <h1 data-edit="headline">{{ headline }}</h1>

          <p class="yt-sub" data-edit="subtext">
            {{ subtext }}
          </p>

          <div class="yt-stats">
            <div>
              <strong data-edit="stat1">120K+</strong>
              <span>Subscribers</span>
            </div>
            <div>
              <strong data-edit="stat2">5M+</strong>
              <span>Total Views</span>
            </div>
            <div>
              <strong data-edit="stat3">100+</strong>
              <span>Videos</span>
            </div>
          </div>

          <button class="yt-btn" data-cta="true" data-edit="ctaText">
            {{ ctaText }}
          </button>

          <p class="yt-note" data-edit="note">
            Limited access. Watch before it gets removed.
          </p>
        </div>
      </div>
    </div>
  );
}
