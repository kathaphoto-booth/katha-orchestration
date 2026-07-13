# Fable 5 Fallback, Billing, & Prompt Remediation Guide

This guide documents the fallback pathways and prompt-engineering remediation strategies developed to address the Claude Fable 5 quota exhaustion (`RESOURCE_EXHAUSTED` / 429) on Vertex AI. By utilizing our Obsidian-enabled workspace and local CLI wrappers, we consolidate this documentation directly into the HAM vault instead of introducing separate Jupyter Notebooks.

---

## 1. Context & Diagnosis
GCP prediction requests for `publishers/anthropic/models/claude-fable-5` currently return a 429 quota block:
```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded for aiplatform.googleapis.com/us_multi_region_online_prediction_requests_per_base_model with base model: anthropic-claude-fable...",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```
Because this limit is applied at the GCP project level, Fable 5 is declared **OFFLINE** for our active local execution. We proceed with the **fallback methods** outlined below.

---

## 2. Advanced Prompt Engineering (Eradicating Laziness)
To prevent agent laziness and maintain maximum performance across fallback models, we integrate psychological and structural prompt-engineering techniques derived from `/Users/jedg./Desktop/kat_ha_pb/scratch/repos/taste-skill/research/laziness/remediation/prompt-engineering.md`:

### 2.1 Psychological latent-space matching
Include high-effort linguistic triggers in system instructions to shift the model's generation probabilities toward high-quality distributions:
* **Incentive Framing**: `"I will tip you $200 for a perfect, production-ready solution with zero placeholders."`
* **Rigor Trigger**: `"Take a deep breath and solve this task step-by-step. This is critical to my career."`

### 2.2 Explicit Syntax Binding & Evidence Blocks
Explicitly restrict conversational discretion and premature truncation:
1. **Mandatory Action Prior to Answer**: Forbid answering strictly from weights. The model must search or run code.
2. **Evidence Blocks**: Force the model to output a `<retrieved_evidence>` block containing raw data, code output, or directory listings *before* generating its narrative response.

### 2.3 XML Structured Prompts
Isolate persistent rules from background and active context:
* `<system_instructions>`: Personas and strict prohibitions on truncation/ellipses (`...`).
* `<context>`: Codebase details and existing files.
* `<data>`: Input logs or target data.
* `<tasks>`: Numbered list of specific, actionable steps.

### 2.4 Self-Verification Loops
Force the model to construct self-evaluation criteria:
1. Generate response.
2. Formulate 3-5 adversarial questions testing its own implementation choices.
3. Answer the questions.
4. Output the final, corrected implementation.

---

## 3. Gemini 3 Pro Multimodal Reimaginings
### 3.1 Can we use Gemini 3 to reimagine base template design and customize Google Fonts style?
**Yes, absolutely.** Google's `"gemini-3-pro-image-preview"` supports dual `"TEXT"` and `"IMAGE"` response modalities inside a single API transaction. We can instruct the model to:
1. Generate a visually stunning base template design as a PNG (`IMAGE` modality).
2. Generate the corresponding CSS styling rule override code (e.g. `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300..700&display=swap'); font-family: 'Cormorant Garamond', serif;`) as structured text (`TEXT` modality).

This couples visual asset synthesis with precise styling configs in a single highly aligned call.

### 3.2 Python Multimodal Reimagining Implementation
Create the following script at `scratch/test_gemini3_multimodal.py` to run this query:
```python
import os
import json
import base64
from google.auth import default
import google.auth.transport.requests
import requests

def test_multimodal_template_reimagining():
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "katha-booth")
    model_id = "gemini-3-pro-image-preview"
    url = f"https://aiplatform.googleapis.com/v1/projects/{project_id}/locations/global/publishers/google/models/{model_id}:generateContent"

    # Authenticate and obtain access token
    credentials, project = default()
    auth_request = google.auth.transport.requests.Request()
    credentials.refresh(auth_request)
    access_token = credentials.token

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Prompt requesting dual image asset + typography config
    prompt_text = (
        "Reimagine the base template design for a premium photo booth layout (Bituin - 'star in the night sky'). "
        "Generate a deconstructed, elegant dark template layout image. Also output the customized Google Fonts import "
        "and CSS rules needed to style the text elements on this template."
    )

    payload = {
        "contents": {
            "role": "user",
            "parts": {
                "text": prompt_text
            }
        },
        "generation_config": {
            "response_modalities": ["TEXT", "IMAGE"]
        }
    }

    print(f"Sending multimodal reimagining request to {model_id}...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        res_data = response.json()
        print("Success! Response received.")
        # Process output text and base64 image data
        with open("scratch/gemini_multimodal_raw_response.json", "w") as f:
            json.dump(res_data, f, indent=2)
        print("Raw response saved to scratch/gemini_multimodal_raw_response.json")
    else:
        print(f"API Call failed with status code {response.status_code}: {response.text}")

if __name__ == "__main__":
    test_multimodal_template_reimagining()
```

---

## 4. Antigravity SDK Streaming Fallback (Last Resort)
If Vertex APIs are fully exhausted, we fallback to streaming messages directly to the Anthropic API key using the `google-antigravity-sdk` framework.

### 4.1 Implementation Pattern
```python
import os
from google_antigravity import LocalAgentConfig, Agent

def stream_to_anthropic_direct():
    # Retrieve the raw Anthropic API key from safe environment variables
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable is missing.")
        return

    # Configure a local agent pointing directly to Anthropic's endpoints
    config = LocalAgentConfig(
        provider="anthropic",
        model="claude-3-5-sonnet-20241022",
        api_key=api_key,
        system_instruction=(
            "You are an elite web application designer. "
            "I will tip you $200 for a perfect, production-grade template review."
        )
    )

    agent = Agent(config=config)
    conversation = agent.create_conversation()

    prompt = "Review the 'Bituin' template layouts inside photobooth-template-studio/new_presets.txt and recommend refinements."
    
    print("Streaming direct Anthropic SDK response:")
    for chunk in conversation.stream_message(prompt):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print("\nStream complete.")

if __name__ == "__main__":
    stream_to_anthropic_direct()
```

---

## 5. Self-Hosted GLM-5.2 Model Garden Deployment
If all fallback cloud APIs fail, we deploy `zai-org/glm-5-2@glm-5.2-fp8` to a dedicated endpoint in `asia-southeast1` using `a4-highgpu-8g` NVIDIA B200 instances:

```bash
# Login to gcloud and configure project
gcloud auth login
gcloud config set project katha-booth

# Deploy Model Garden endpoint
gcloud ai model-garden models deploy \
  --model="zai-org/glm-5-2@glm-5.2-fp8" \
  --region="asia-southeast1" \
  --project="katha-booth" \
  --accept-eula \
  --machine-type="a4-highgpu-8g" \
  --accelerator-type="NVIDIA_B200" \
  --container-image-uri="us-docker.pkg.dev/vertex-ai/vertex-vision-model-garden-dockers/pytorch-sglang-serve:airlock-v0.5.13.post1" \
  --use-dedicated-endpoint \
  --reservation-affinity reservation-affinity-type=no-reservation \
  --endpoint-display-name="glm-5_2-fp8-mg-one-click-deploy"
```
