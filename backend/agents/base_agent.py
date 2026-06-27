import os
from langchain_openai import AzureChatOpenAI, ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()


class BaseAgent:
    """Base Agent"""

    def __init__(self):
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        azure_deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
        openai_api_key = os.getenv("OPENAI_API_KEY")

        def _is_real_value(value: str | None) -> bool:
            if not value:
                return False
            normalized = value.strip().lower()
            return not any(token in normalized for token in ["your-", "placeholder", "example", "changeme", "here"])

        use_azure = all(
            _is_real_value(value)
            for value in [azure_endpoint, azure_api_key, azure_api_version, azure_deployment_name]
        )

        if use_azure:
            self.llm = AzureChatOpenAI(
                azure_endpoint=azure_endpoint,
                api_key=azure_api_key,
                api_version=azure_api_version,
                deployment_name=azure_deployment_name,
                temperature=0.7,
                max_tokens=3000
            )
        else:
            self.llm = ChatOpenAI(
                api_key=openai_api_key,
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                temperature=0.7,
                max_tokens=3000
            )


    def invoke(self, system_prompt:str, user_prompt:str) -> str:
        """Invoke the LLM with user and system prompt"""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]

        response = self.llm.invoke(messages)

        return response.content