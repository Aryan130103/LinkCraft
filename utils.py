import string
from urllib.parse import urlparse

def url_validation(url):
    parsed_url=urlparse(url)
    return bool(parsed_url.scheme) and bool(parsed_url.netloc)

Characters = string.digits + string.ascii_lowercase + string.ascii_uppercase

def encode_base62(num):
  if num == 0:
    return Characters[0]
  
  result=""
  n=len(Characters)

  while num>0:
    r=num%n
    result=Characters[r] + result
    num=num//n
  
  return result

if __name__ == "__main__":
  num=int(input("Enter a number to encode in base62: "))
  print(encode_base62(num))
