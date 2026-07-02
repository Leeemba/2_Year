.data

input_addr:      .word  0x80
output_addr:     .word  0x84

    .text
    .org 0x100

_start:
    lui      sp, %hi(0x1000)
    addi     sp, sp, %lo(0x1000)

    lui      t0, %hi(input_addr)
    addi     t0, t0, %lo(input_addr)
    lw       t0, 0(t0)

    lw       a0, 0(t0)

    jal      ra, proc_is_binary_palindrome

    lui      t0, %hi(output_addr)
    addi     t0, t0, %lo(output_addr)
    lw       t0, 0(t0)

    sw       a0, 0(t0)

    halt

proc_is_binary_palindrome:
    addi     sp, sp, -4
    sw       ra, 0(sp)

    addi     a1, zero, 31
    addi     a2, zero, 0

    jal      ra, proc_palindrome_recursive

    lw       ra, 0(sp)
    addi     sp, sp, 4
    jr       ra

proc_palindrome_recursive:
    addi     sp, sp, -16
    sw       ra, 12(sp)
    sw       a1, 8(sp)
    sw       a2, 4(sp)
    sw       a0, 0(sp)

    ble      a1, a2, L_rec_base_true

    srl      t1, a0, a1
    andi     t1, t1, 1

    srl      t2, a0, a2
    andi     t2, t2, 1

    bne      t1, t2, L_rec_base_false

    addi     a1, a1, -1
    addi     a2, a2, 1

    jal      ra, proc_palindrome_recursive

    j        L_rec_end

L_rec_base_true:
    addi     a0, zero, 1
    j        L_rec_end

L_rec_base_false:
    addi     a0, zero, 0
    j        L_rec_end

L_rec_end:
    lw       ra, 12(sp)
    lw       a1, 8(sp)
    lw       a2, 4(sp)
    addi     sp, sp, 16
    jr       ra