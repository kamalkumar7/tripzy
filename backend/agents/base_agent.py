import os
from langchain_openai import AzureChatOpenAI
from langchain_core.message import HumanMessage, SystemMessage
from env import load_dotenv

load_dotenv()



class BaseAgent:
    """Base Agent"""

    def __init__(self):
        self.llm = AzureChatOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
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