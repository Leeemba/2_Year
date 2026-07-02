.data

input_addr:      .word  0x80
n:               .word  0x00
i:               .word  0x00
const_1:         .word  0x01
const_2:         .word  0x02
output_addr:     .word  0x84

.text

.org  0x100
_start:
    load         input_addr
    load_acc
    store        n

    ; if n < 1: return -1
    load         n
    sub          const_1
    bltz         out_minus1

    ; if n == 1: return 0
    load         n
    sub          const_1
    beqz         out_zero

    ; n >= 2: инициализация i = 2
    load         const_2
    store        i

loop:
    ; i*i > n ?
    load         i
    mul          i
    sub          n
    bgtz         out_one

    ; n % i == 0 ?
    load         n
    rem          i
    beqz         out_zero

    ; i++
    load         i
    add          const_1
    store        i
    jmp          loop

out_one:
    load_imm     1
    jmp          write_result

out_zero:
    load_imm     0
    jmp          write_result

out_minus1:
    load_imm     -1

write_result:
    store_ind    output_addr
    halt