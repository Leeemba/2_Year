.data

input_addr:      .word  0x80
output_addr:     .word  0x84
in_buf:          .word  0x400
out_buf:         .word  0x800
stack_top:       .word  0x1000

    .text
    .org     0x100

_start:
    movea.l  stack_top, A7
    movea.l  (A7), A7

    movea.l  input_addr, A2
    movea.l  (A2), A2
    movea.l  output_addr, A3
    movea.l  (A3), A3

    move.l   (A2), D0

    cmp.l    0, D0
    blt      sys_error_domain
    beq      sys_handle_zero

    move.l   D0, -(A7)
    jsr      proc_read_input
    move.l   (A7)+, D0

    move.l   D0, -(A7)
    jsr      proc_compress
    move.l   (A7)+, D0

    move.l   D1, -(A7)
    jsr      proc_write_output
    move.l   (A7)+, D1

    halt

sys_error_domain:
    move.l   -1, (A3)
    halt

sys_handle_zero:
    move.l   0, (A3)
    halt

proc_read_input:
    link     A6, -4
    move.l   D0, -4(A6)

    movea.l  input_addr, A2
    movea.l  (A2), A2
    movea.l  in_buf, A0
    movea.l  (A0), A0

    move.l   D0, D1

ri_loop:
    cmp.l    0, D1
    ble      ri_end

    move.l   (A2), D4

    move.l   D4, D6
    move.l   24, D7
    lsr.l    D7, D6
    move.b   D6, (A0)+
    sub.l    1, D1
    cmp.l    0, D1
    ble      ri_end

    move.l   D4, D6
    move.l   16, D7
    lsr.l    D7, D6
    move.b   D6, (A0)+
    sub.l    1, D1
    cmp.l    0, D1
    ble      ri_end

    move.l   D4, D6
    move.l   8, D7
    lsr.l    D7, D6
    move.b   D6, (A0)+
    sub.l    1, D1
    cmp.l    0, D1
    ble      ri_end

    move.l   D4, D6
    move.b   D6, (A0)+
    sub.l    1, D1

    jmp      ri_loop

ri_end:
    unlk     A6
    rts

proc_compress:
    link     A6, -16
    move.l   D0, -4(A6)
    move.l   0, -8(A6)
    move.l   0, -12(A6)

    movea.l  in_buf, A0
    movea.l  (A0), A0
    movea.l  out_buf, A1
    movea.l  (A1), A1

cr_outer_loop:
    move.l   -8(A6), D2
    move.l   -4(A6), D3
    cmp.l    D3, D2
    bge      cr_end

    move.l   0, D4
    move.b   0(A0,D2), D4
    and.l    255, D4
    move.l   D4, -16(A6)

    move.l   1, D5

cr_inner_loop:
    move.l   -8(A6), D2
    add.l    D5, D2
    move.l   -4(A6), D3
    cmp.l    D3, D2
    bge      cr_inner_break

    move.l   0, D6
    move.b   0(A0,D2), D6
    and.l    255, D6
    cmp.l    D4, D6
    bne      cr_inner_break

    cmp.l    255, D5
    bge      cr_inner_break

    add.l    1, D5
    jmp      cr_inner_loop

cr_inner_break:
    move.l   -12(A6), D3
    move.b   D5, 0(A1,D3)
    add.l    1, D3
    move.b   D4, 0(A1,D3)

    add.l    1, D3
    move.l   D3, -12(A6)

    move.l   -8(A6), D2
    add.l    D5, D2
    move.l   D2, -8(A6)

    jmp      cr_outer_loop

cr_end:
    move.l   -12(A6), D1
    unlk     A6
    rts

proc_write_output:
    link     A6, -8
    move.l   D1, -4(A6)

    movea.l  output_addr, A3
    movea.l  (A3), A3

    move.l   D1, (A3)

    move.l   D1, D2
    movea.l  out_buf, A1
    movea.l  (A1), A1

wo_loop:
    cmp.l    0, D2
    ble      wo_end

    move.l   0, D4

    cmp.l    0, D2
    ble      wo_write
    move.l   0, D6
    move.b   (A1)+, D6
    and.l    255, D6
    move.l   24, D7
    lsl.l    D7, D6
    or.l     D6, D4
    sub.l    1, D2

    cmp.l    0, D2
    ble      wo_write
    move.l   0, D6
    move.b   (A1)+, D6
    and.l    255, D6
    move.l   16, D7
    lsl.l    D7, D6
    or.l     D6, D4
    sub.l    1, D2

    cmp.l    0, D2
    ble      wo_write
    move.l   0, D6
    move.b   (A1)+, D6
    and.l    255, D6
    move.l   8, D7
    lsl.l    D7, D6
    or.l     D6, D4
    sub.l    1, D2

    cmp.l    0, D2
    ble      wo_write
    move.l   0, D6
    move.b   (A1)+, D6
    and.l    255, D6
    or.l     D6, D4
    sub.l    1, D2

wo_write:
    move.l   D4, (A3)
    jmp      wo_loop

wo_end:
    unlk     A6
    rts