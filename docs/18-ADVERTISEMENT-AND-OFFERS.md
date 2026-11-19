# 18: Advertisement & Promotional Campaigns

## 1. System Overview
Every hospital and clinic possesses an independent promotional campaign authoring module. This allows healthcare providers to publicize special packages (e.g. Master Executive Health Checkup - ₹1499, Complete Diabetes Care Plan - ₹499) directly to patients browsing the platform.

## 2. Multi-Stage Approval Workflow
```
[Draft] ──► [Submit for Review] ──► [Super Admin Moderation]
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
             [Approved]                                        [Rejected]
                  │
                  ▼
        [Published to Public] ──► [Expired]
```
- **Draft**: Hospital administrator creates the package details, original price, discounted price, and validity dates.
- **Submit for Review**: Status becomes `pending_review`.
- **Super Admin Moderation**: Platform administrator reviews package terms and clicks **Approve & Publish** or **Reject**.
- **Published**: Displayed on public directory pages, featured carousels, and patient offer tabs.
