#include <stdio.h>
#include <stdlib.h>

void encrypt(char * word, int shift);
void decrypt(char * word, int shift);

int main(int argc, char * argv[]){
    printf("Hello world!\n ");
    printf("argc = %d argv = %s\n",argc,argv[1]);


    if(argc != 3){
        printf("Incorrect usage");
        return 1;
    }
    char * word = argv[1];
    int shift = atoi(argv[2]);

    printf("word =  %s\n",word);
    printf("shift = %d\n",shift);
    
    encrypt(word,shift);
    printf("result = %s\n",word);
    
    decrypt(word,shift);
    printf("decr_result = %s",word);
    return 0;
}


    void encrypt(char * word, int shift){
        for(int i = 0; word[i] != '\0';i++ ){
            char current_char = word[i];     // каждая строка в c заканчивается на \0
        // a = 0, a+1 = b(1)
        // a +26 =>  a
        // z +1 => a
            if(current_char >= 'a' && current_char <= 'z'){
                // a(144) + 1 = b
                // 'a' + 0-25 = 144 + 0-25 = 'a'-'z'
                // 144
                word[i] = 'a'+(current_char - 'a' + shift%26 +26)%26;
            }
            if(current_char >= 'A' && current_char <= 'Z'){
                word[i] = 'A'+(current_char - 'A' + shift%26+26)%26;
            }

        }
    }


    void decrypt(char * word, int shift){
        for(int i = 0; word[i] != '\0';i++){
            char current_char = word[i];
            if(current_char >= 'a' && current_char <= 'z'){
                // a + (a - a  - 52 + 25) %26
                // a + (-27)%26
                // a + (-1)
                word[i]= 'a'+(current_char -'a' - shift%26+26)%26;
            }
            if(current_char >= 'A' && current_char <= 'Z'){
                word[i]= 'A'+(current_char -'A'- shift%26+26)%26;
            }
        }
    }
   
    
   