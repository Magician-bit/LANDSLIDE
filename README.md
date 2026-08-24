# Landslide Detector

Mountain Disaster Intelligence & Resilience Platform

## 1. Overview
Landslide Detector is an AI-powered Mountain Disaster Intelligence & Resilience Platform. It provides predictive modeling, real-time monitoring, network impact analysis, and emergency response prioritization for mountainous regions vulnerable to mass wasting events.

## 2. Problem Statement
Mountainous communities are increasingly threatened by climate-induced landslides. Traditional hazard management often relies on static maps or delayed post-disaster satellite imagery, leading to slow response times, unaware populations, and unoptimized resource allocation when critical infrastructure fails.

## 3. Why Existing Landslide Maps Are Not Enough
Existing maps are often static and only represent historical susceptibility. They fail to capture the dynamic nature of triggers (such as intense rainfall and soil moisture) and do not provide real-time, actionable insights for emergency responders or simulate cascading infrastructure failures.

## 4. Core Differentiator
Landslide Detector bridges the gap between raw environmental data and actionable emergency response. By merging a deterministic risk engine with a topological infrastructure graph, it predicts not only *where* a landslide is likely to occur, but also *who* will be isolated and *how* to prioritize rescue efforts.

## 5. System Objectives
- Predict landslide risk dynamically based on environmental triggers.
- Quantify population exposure and infrastructure vulnerability.
- Analyze connectivity to detect isolated communities.
- Prioritize emergency response using explainable metrics.
- Provide a responsive scenario simulator for disaster preparedness.

## 6. End-to-End Intelligence Pipeline
Environmental Monitoring → Feature Engineering → Susceptibility Detection → Trigger Detection → Spatiotemporal Prediction → Risk Forecasting → Hazard Footprint → Impact Simulation → Infrastructure/Community Connectivity Analysis → Isolation Detection → Response Prioritization → Explainable Alert → Human Verification → Ground-Truth Feedback.

## 7. Architecture
The current implementation is a fully client-side prototype. The architecture combines a deterministic inference engine, a geospatial rendering layer (Leaflet), a directed graph network analyzer (Dijkstra's algorithm), and a modular React frontend to deliver real-time interactive intelligence without backend dependencies.

## 8. Environmental Data Inputs
The system ingests and processes variables including precipitation (1h, 24h, rolling averages), soil moisture, slope angle, elevation, terrain ruggedness index (TRI), normalized difference vegetation index (NDVI), and historical landslide inventories.

## 9. Feature Engineering
Raw inputs are transformed into predictive features: rainfall anomalies, soil saturation trends, convergence indices, and geomorphological susceptibility scores.

## 10. Static Susceptibility Model
Calculates baseline risk using immutable or slowly-changing factors like slope, elevation, aspect, and geological composition.

## 11. Dynamic Trigger Model
Integrates transient weather data—specifically acute rainfall and soil moisture saturation—to spike the baseline susceptibility into an active risk metric.

## 12. XGBoost Production Architecture
In a live production environment, an XGBoost gradient boosting framework handles the non-linear interactions between heavy rainfall events and specific topographical profiles, providing highly calibrated risk probabilities.

## 13. Random Forest Baseline
A Random Forest ensemble serves as the robust baseline model, handling high-dimensional, noisy environmental data to provide reliable feature importance rankings and initial risk assessments.

## 14. SHAP Explainability
The platform utilizes SHAP (SHapley Additive exPlanations) style feature attribution to transparently display which variables (e.g., rainfall vs. slope) are driving the current risk score.

## 15. Temporal Forecasting
Risk is not static. The system provides 6h, 12h, and 24h risk forecasts by modeling the momentum of current weather events against soil drainage capacities.

## 16. Raster/Grid Risk Surface
Geospatial risk is conceptualized as a continuous grid surface, allowing precise hazard window estimations and sub-regional susceptibility profiling.

## 17. Hazard Footprint
When risk crosses critical thresholds, the engine projects a hazard footprint detailing the estimated spatial extent of potential mass wasting.

## 18. Impact Engine
Calculates human and structural exposure by intersecting the hazard footprint with population density data and critical infrastructure layers.

## 19. Infrastructure Graph
Roads, bridges, hospitals, and settlements are modeled as nodes and edges in a directed network graph, allowing topological analysis of the region.

## 20. Dijkstra Shortest Path Analysis
Utilizes Dijkstra's algorithm to calculate the shortest travel times between settlements and critical services (like hospitals). When infrastructure fails, the graph updates and recalculates instantly.

## 21. Isolation Risk
Quantifies the vulnerability of communities by measuring their loss of connectivity to the wider network and essential services during a disaster.

## 22. Response Priority
Synthesizes hazard severity, population exposure, and isolation risk into a single prioritized queue, guiding emergency management to the most critical locations first.

## 23. Scenario Simulator
Allows planners to interactively inject extreme weather conditions (Heavy Rainfall, Soil Saturation) or simulate cascading infrastructure failures (Road Blockages, Bridge Failures) to observe network-wide consequences.

## 24. Field Intelligence
Integrates crowdsourced and responder-submitted field reports (e.g., slope cracks, seepage, rockfalls) complete with GPS coordinates and severity classifications.

## 25. Ground-Truth Feedback
Verified field reports act as ground-truth evidence, feeding back into the system to increase model confidence and locally adjust risk scores.

## 26. Location Intelligence
Provides deep-dive analytics for specific zones, featuring temporal risk charts, specific model explanations, impact metrics, and representative local imagery.

## 27. Alerts
An automated alert system that escalates warnings based on rapid risk momentum, critical threshold crossings, or confirmed infrastructure isolation.

## 28. Reports
Generates comprehensive situation reports encompassing risk forecasts, isolated populations, ground evidence, and response priorities.

## 29. UI Architecture
Built with React, Vite, and Tailwind CSS. The interface is designed for high-stress operational environments, utilizing dark modes, clear data visualization (Recharts), and responsive panel layouts.

## 30. Prototype Data
The current deployment utilizes representative, deterministic data to simulate a region in the Himalayas (Darjeeling/Kalimpong). It is built to demonstrate the intelligence pipeline without requiring a live backend connection.

## 31. Prototype Limitations
As a static prototype, the risk engine uses deterministic mathematical models rather than live ML inference. Data is simulated and does not reflect real-time live satellite or meteorological telemetry.

## 32. Production Roadmap
Transition from deterministic simulation to live API ingestion (e.g., NASA GPM, ESA Sentinel), deploy server-side ML inference, and establish real-time WebSocket connections for field teams.

## 33. Future LSTM/Temporal CNN/Transformer
Implementation of sequence models to better capture the temporal dynamics of rainfall accumulation and soil moisture decay over extended periods.

## 34. Future GNN
Adoption of Graph Neural Networks (GNNs) to natively predict infrastructure cascade failures and complex spatial dependencies across the mountain road network.

## 35. Future Sentinel-1/InSAR
Integration of synthetic-aperture radar (SAR) interferometry to detect millimeter-scale precursory slope deformations prior to catastrophic failure.

## 36. Model Evaluation Strategy
Robust ML lifecycle management utilizing strict spatial and temporal cross-validation to prevent data leakage and ensure generalizability across different topographies.

## 37. Spatial Train/Test Splits
Ensuring models are trained and evaluated on geographically distinct watersheds to prove they can generalize to unseen valleys.

## 38. Temporal Validation
Testing models on sequential temporal blocks (e.g., training on 2010-2020, testing on 2021-2023) to validate predictive power against shifting climate baselines.

## 39. Precision
Minimizing false positives to prevent alarm fatigue among emergency responders and the public.

## 40. Recall
Maximizing the detection of actual landslide events; in disaster management, missing an event is critical.

## 41. F1
Balancing precision and recall for a comprehensive view of model accuracy in highly imbalanced datasets (where non-landslide days vastly outnumber landslide days).

## 42. PR-AUC
Utilizing the Precision-Recall Area Under the Curve as the primary metric for imbalanced classification.

## 43. ROC-AUC
Monitoring the Receiver Operating Characteristic to measure the model's ability to distinguish between stable and unstable conditions.

## 44. Calibration
Ensuring that predicted risk probabilities accurately reflect true empirical frequencies (e.g., a predicted 80% risk translates to an actual 80% event occurrence).

## 45. False-Negative Risk
Prioritizing the minimization of false-negatives, as unpredicted slope failures carry the highest cost in human life.

## 46. Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Geospatial:** Leaflet, React-Leaflet
- **Data Visualization:** Recharts
- **Network Analysis:** Custom Dijkstra/Graph Implementation

## 47. Project Structure
- `/src/components`: UI modules (Map, Command Center, Scenario Simulator).
- `/src/data`: Prototype representative datasets.
- `/src/hooks`: React hooks for state and intelligence orchestration.
- `/src/intelligence`: The core deterministic risk and graph engines.
- `/src/types`: Strict TypeScript definitions.

## 48. Local Development & Environment Configuration
```bash
npm ci
# Create a .env file and add your Gemini API Key:
# GEMINI_API_KEY=your_gemini_api_key_here
npm run dev
```

## 49. Production Build
```bash
npm run build
```
This generates the optimized client application in `/dist` and bundles the Node server handler.

## 50. Netlify Deployment & Gemini Vision Setup
When deploying to Netlify:
1. **Repository Settings**: Deploy using `netlify.toml` which automatically builds with `npm run build` and directs functions from `netlify/functions`.
2. **Configure Environment Variable**:
   - In your Netlify Site Dashboard, navigate to **Site configuration** → **Environment variables**.
   - Click **Add a variable** → **Add a single variable**.
   - Key: `GEMINI_API_KEY`
   - Value: `<your Google Gemini API Key>`
   - Scope: Functions & Builds
3. **Verify Deployment Health**:
   - Check `https://<your-site>.netlify.app/api/health`
   - Should return: `{"status":"ok","geminiConfigured":true,"timestamp":"..."}`
4. **Multimodal Vision Flow**:
   - Client sends base64 image + MIME type via `POST /api/analyze-image`.
   - Netlify Function invokes `gemini-2.5-flash` with structured JSON schema.
   - React UI displays `GEMINI VISION ANALYSIS` with confidence scores and physical evidence.

## 51. GitHub Pages Deployment
The project is configured for automated deployment via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to the `main` branch automatically builds and deploys the static `/dist` artifact to GitHub Pages.

## 52. Disclaimer
This is a demonstration prototype. It is not intended for live emergency management or life-safety decisions. Do not rely on this application for actual disaster response.
