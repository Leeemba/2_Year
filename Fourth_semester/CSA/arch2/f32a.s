.data

buffer:          .word  0x5f5f5f5f
b_1:             .word  0x5f5f5f5f
b_2:             .word  0x5f5f5f5f
b_3:             .word  0x5f5f5f5f
b_4:             .word  0x5f5f5f5f
b_5:             .word  0x5f5f5f5f
b_6:             .word  0x5f5f5f5f
b_7:             .word  0x5f5f5f5f

pad_01:          .word  0
pad_02:          .word  0
pad_03:          .word  0
pad_04:          .word  0
pad_05:          .word  0
pad_06:          .word  0
pad_07:          .word  0
pad_08:          .word  0
pad_09:          .word  0
pad_10:          .word  0
pad_11:          .word  0
pad_12:          .word  0
pad_13:          .word  0
pad_14:          .word  0
pad_15:          .word  0
pad_16:          .word  0
pad_17:          .word  0
pad_18:          .word  0
pad_19:          .word  0
pad_20:          .word  0
pad_21:          .word  0
pad_22:          .word  0
pad_23:          .word  0
pad_24:          .word  0
pad_25:          .word  0
pad_26:          .word  0

q_str:           .byte  'What is your name?\n\0\0\0'

    .text

_start:
    0x84 b!
    proc_print_q
    proc_read_input
    proc_build_pstr
    proc_print_greet
    halt


proc_print_q:
    lit q_str a!
    18 >r
print_q_loop:
    @+ 255 and !b
    next print_q_loop
    ;


proc_read_input:
    0
    8 a!
read_loop:
    dup 23 xor
    if err_empty
    @p 0x80
    dup 10 xor
    if read_end
    !+
    1 +
    read_loop ;
read_end:
    drop
    dup
    if err_empty
    ;


proc_build_pstr:
    dup
    0x6c654808 +
    0 a! !

    0x202c6f6c
    4 a! !

    dup 8 + a!
    0x5f5f5f21 !
    ;


proc_print_greet:
    7 + >r
    1 a!
greet_loop:
    @+ 255 and !b
    next greet_loop
    ;

err_empty:
    drop
    0xCCCCCCCC !b
    halt