from pydantic import BaseModel


class LoginFormContract(BaseModel):
    username: str
    password: str
