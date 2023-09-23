# Dev Guide

<details open>
  <summary>
    <h2>Defining Steps</h2>
  </summary>

**Steps are small chucks of code that are executed in a specific order.** You
can run them one after another using the UI. To make it easier to define steps,
I used the following structure and conventions.

You define a step by using the

```python
@stepmethod
```

decorator. You can provide a **description** that is displayed in the UI. The
method must **return a step method** that corresponds to the next step. If it
returns `None`, the exceution of the step chain exits.

```python
@stepmethod("This is an example step")
def example1():
    # Do something
    print("example1 running")
    return example2

@stepmethod()
def example2():
    return None
```

The decorator encapsulates the function into a method that returns a step, i.e.
is of type `Callable[[], Step | None]`. You can execute the step like this:

```python
step: Step = example1()
print(step.description)         # Prints "This is an example step"
next_step: Step = step.run()    # Prints "example1 running"
```

### Groups

A step can also itself consist of several sub-steps.

```python
@stepmethod("example1")
def example1():
    @stepmethod("inner1")
    def inner1():
        print("inner1 running")
        return inner2

    @stepmethod("inner2")
    def inner2():
        print("inner2 running")
        return None

    return inner1
```

Groups can be nested multiple times.

### Call Signature

```python
def stepmethod(
    html: str = "",
    run_immediately: bool = False,
    needs_focus: bool = False,
):
    """
    Parameters
    ----------
    html : str, optional
        The content that is displayed in the UI for this step, by default ""
    run_immediately : bool, optional
        If True, the given step method is executed immediately and the resulting
        next step is returned instead, by default False. This is useful for
        grouping steps together.
    needs_focus : bool, optional
        If True and the UI is open, Alt+Tab is simulated before the step is
        executed, by default False. This is useful for steps that use the
        keyboard.

    Returns
    -------
    Callable[..., Step | None]
        The wrapped step method
    """
```

### State

You can use this to do conditional branching. Use the `nonlocal` keyword to
write to variables in the outer scope. Keep in mind that the steps can be
executed independently in the UI, so ideally they should depend only on the
state of the game to simplify debugging.

```python
import random

def entry():
    yield group()

@stepmethod()
def group():
    state = 0

    @stepmethod()
    def step_write():
        nonlocal state
        state = random.randint(0, 1)
        return step_read

    @stepmethod()
    def step_read():
        if state == 0:
            print("state is 0")
        else:
            print("state is 1")
        return None

    return step_write
```

Passing parameters to a step is supported. If inside a `stepmethod`, wrap the step
function call in a lambda.

```python
def entry():
    yield step1("Hello World!")

@stepmethod()
def step1(param1: str):
    print(param1)
    return lambda: step2(42)


@stepmethod()
def step2(param2: int):
    print(param2)
    return None
```

This produces the output:

```python
Hello World!
42
```

### Entry

The entry point of the step chain is a generator function that yields objects of
type `Step`. The next step will be generated when the previous step chain is
is finished. Once the generator is exhausted, the execution of the step chain
exits.

```python
def entry():
    yield step1()
    for i in range(2):
        yield step2(i)

@stepmethod()
def step1():
    print("step1")
    return None

@stepmethod()
def step2(i: int):
    print(f"step2 {i}")
    return None
```

This produces the output:

```python
step1
step2 0
step2 1
```

</details>
