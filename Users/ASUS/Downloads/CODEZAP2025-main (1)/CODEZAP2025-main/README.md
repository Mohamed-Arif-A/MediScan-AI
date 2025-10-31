🤝 URUTHUNAI

URUTHUNAI (உறுதுணை), meaning "trustable and supportable," is a hyper-local, real-time matching platform designed to connect NGO needs with local heroes.

This project was built for the CODEZAP 2025 hackathon.

🎯 The Objective

Local NGOs and community organizations often struggle with inefficient coordination when they have urgent needs (like for food, medicine, or clothes). At the same time, many people are willing to donate or volunteer, but they have no easy way to see the real-time needs in their immediate area.

URUTHUNAI solves this by acting as an intelligent bridge. It's not just a directory; it's an instant matcher that connects a specific need to the closest available donor.

✨ The Solution

When an NGO in Tambaram, Chennai posts an urgent request for "50 blankets," our system instantly queries all registered donors. It then pushes this request only to the dashboards of donors who are within a 5km radius, ensuring that help comes from the local community, for the local community.

🚀 Core Features

🌍 Geo-enabled Matching: The core logic runs on a 5km radius filter.

🔑 Dual-Role Authentication: Separate portals and dashboards for "NGOs" (who post needs) and "Donors" (who fulfill them).

📍 Forced Location Setup: A critical, non-skippable step after login to ensure the matching system works for every user.

🚀 Real-time Request Board: Needs posted by NGOs appear on donor dashboards instantly (using Firebase Firestore).

🔄 Closed-Loop Feedback: The system provides instant confirmation for both parties:

NGO: "The donation was received!"

Donor: "Thanks for Donating! Your humanity saves someone's need."

📊 Donation History: Both users can track their past requests and donations.

🌊 User Workflow

Home Page: A user lands on the page, sees the project's objective, and chooses one of two portals: "NGO Portal" or "Donor Portal".

Auth Page: The user is taken to a branded Login / Sign Up page for their chosen role.

Location Setup: Immediately after login/signup, the user must enable their location. The app confirms their location (e.g., "Tambaram, Chennai").

NGO Posts Need: An NGO is taken to their dashboard and creates a new request, categorized by Food, Clothes, Medicine, etc.

Donor Sees Need: The request instantly appears on the dashboards of all donors within a 5km radius of the NGO.

Donor Accepts: A donor sees the request and clicks "I Can Help!"

Confirmation:

The NGO's dashboard updates to show "Donation Received," and the request moves to their "History."

The donor's dashboard shows a "Thank You" message, and the next available need is displayed.

🛠️ Tech Stack

Frontend: React, React Router

Backend & Database: Firebase (Firestore, Firebase Authentication)

Geo-Matching: geofire-common to handle the 5km geospatial queries

Styling: CSS
