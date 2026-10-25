import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalContent {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const CONTENT: Record<string, LegalContent> = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Academic Hub is a student collaboration platform. This policy explains what information we store and how it is used.',
    sections: [
      {
        heading: 'Information we collect',
        body: 'We store the account details you provide when you register (name, email address and optional profile information), as well as the content you create such as posts, projects, communities and messages.',
      },
      {
        heading: 'How information is used',
        body: 'Your information is used to operate the platform, display your public profile, connect you with collaborators and secure your account. We do not sell personal data.',
      },
      {
        heading: 'Storage and security',
        body: 'Data is stored in Supabase with row-level security policies. Authentication is handled by Supabase Auth. You should still use a strong, unique password and keep your account credentials private.',
      },
      {
        heading: 'Your rights',
        body: 'You can update your profile information from the profile page at any time. To request deletion of your account and associated content, contact your platform administrator.',
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro:
      'By using Academic Hub you agree to the following rules, which exist to keep the community useful and safe for everyone.',
    sections: [
      {
        heading: 'Respectful participation',
        body: 'Harassment, hate speech, spam and deliberately misleading content are not allowed. Discussions should remain relevant to academic work and the communities you join.',
      },
      {
        heading: 'Your content',
        body: 'You retain ownership of the content you publish. You are responsible for ensuring that you have the right to share it and that it does not infringe on the rights of others.',
      },
      {
        heading: 'Academic integrity',
        body: 'Academic Hub is intended for collaboration and learning. Do not use the platform to facilitate plagiarism or other violations of your institution’s academic integrity policies.',
      },
      {
        heading: 'Account responsibility',
        body: 'You are responsible for activity performed through your account. Report any unauthorised access or security concern to your platform administrator as soon as possible.',
      },
    ],
  },
};

@Component({
  selector: 'app-legal',
  standalone: true,
  template: `
    <article class="legal-page">
      <h1>{{ content.title }}</h1>
      <p class="legal-intro">{{ content.intro }}</p>
      <p class="legal-updated">Last updated: October 2026</p>

      @for (section of content.sections; track section.heading; let index = $index) {
        <section class="legal-section">
          <h2>{{ index + 1 }}. {{ section.heading }}</h2>
          <p>{{ section.body }}</p>
        </section>
      }
    </article>
  `,
  styles: [
    `
      .legal-page {
        max-width: 780px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }

      h1 {
        margin: 0 0 0.75rem;
        font-size: 2rem;
        font-weight: 800;
        color: #0f172a;
      }

      .legal-intro {
        margin: 0;
        color: #475569;
        font-size: 1.02rem;
        line-height: 1.75;
      }

      .legal-updated {
        margin: 0.75rem 0 2rem;
        color: #94a3b8;
        font-size: 0.85rem;
      }

      .legal-section {
        margin-bottom: 1.75rem;
        padding: 1.5rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
      }

      .legal-section h2 {
        margin: 0 0 0.6rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
      }

      .legal-section p {
        margin: 0;
        color: #475569;
        line-height: 1.75;
      }

      @media (max-width: 600px) {
        .legal-page {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class Legal {
  private readonly route = inject(ActivatedRoute);
  private readonly section = this.route.snapshot.data['section'] as string;
  readonly content = CONTENT[this.section] ?? CONTENT['privacy'];
}
